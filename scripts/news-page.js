(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Very small markdown-ish renderer: paragraphs + bullet lists
  function renderBody(md) {
    if (!md) return "";
    const lines = String(md).split(/\r?\n/);
    let html = "";
    let inList = false;

    for (const rawLine of lines) {
      const line = rawLine.trimRight();
      if (!line.trim()) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        continue;
      }

      if (/^\-\s+/.test(line.trim())) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += "<li>" + escapeHtml(line.trim().replace(/^\-\s+/, "")) + "</li>";
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += "<p>" + escapeHtml(line) + "</p>";
      }
    }

    if (inList) html += "</ul>";
    return html;
  }

  function formatDate(iso) {
    if (!iso) return "";
    return String(iso).slice(0, 10);
  }

  async function init() {
    const listEl = document.getElementById("news-list");
    const detailEl = document.getElementById("news-detail");
    if (!listEl || !detailEl) return;

    detailEl.innerHTML = "<h3>Select a news item</h3><p class='date'> </p><div class='body'><p>Click a card on the left to see details here.</p></div>";

    let items = [];
    try {
      const res = await fetch("content/news.json", { cache: "no-store" });
      items = await res.json();
    } catch (e) {
      detailEl.innerHTML = "<h3>News</h3><div class='body'><p>Failed to load news data. Check that <code>content/news.json</code> exists.</p></div>";
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      detailEl.innerHTML = "<h3>News</h3><div class='body'><p>No news posts yet.</p></div>";
      return;
    }

    // newest first if date exists
    items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    function selectItem(item) {
      detailEl.innerHTML =
        "<h3>" + escapeHtml(item.title || "Untitled") + "</h3>" +
        "<div class='date'>" + escapeHtml(formatDate(item.date)) + "</div>" +
        "<div class='body'>" + renderBody(item.body) + "</div>";
    }

    listEl.innerHTML = "";
    items.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.innerHTML =
        (item.image ? "<img alt='' src='" + escapeHtml(item.image) + "' />" : "") +
        "<div class='meta'>" +
          "<div class='title'>" + escapeHtml(item.title || "Untitled") + "</div>" +
          "<div class='date'>" + escapeHtml(formatDate(item.date)) + "</div>" +
        "</div>";
      card.addEventListener("click", () => selectItem(item));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectItem(item);
        }
      });
      listEl.appendChild(card);

      // Auto-select first item
      if (idx === 0) selectItem(item);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
