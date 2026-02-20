(function () {
  "use strict";

  // Resolve base path so /news (pretty URL) still loads assets + JSON correctly.
  const NEWS_JSON_URL = "/content/news.json";

  const listEl = document.getElementById("news-list");
  const detailEl = document.getElementById("news-detail");
  const emptyEl = document.getElementById("news-empty");
  let activeId = null;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    // Accept ISO or yyyy-mm-dd
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderMarkdownLite(text) {
    // Simple safe-ish formatting: paragraphs + line breaks.
    // (We intentionally avoid full markdown parsing for safety/simplicity.)
    const safe = escapeHtml(text);
    return safe
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function setActiveCard(card) {
    if (!listEl) return;
    const cards = listEl.querySelectorAll(".news-card");
    cards.forEach((c) => c.classList.remove("active"));
    if (card) card.classList.add("active");
  }

  function showDetail(item) {
    if (!detailEl) return;

    // Click-to-show: when nothing selected, keep the panel hidden.
    detailEl.classList.remove("is-hidden");

    const title = escapeHtml(item.title || "");
    const date = escapeHtml(formatDate(item.date));
    const img = item.thumbnail ? `<img class="news-detail-image" src="${escapeHtml(item.thumbnail)}" alt="${title}">` : "";
    const body = renderMarkdownLite(item.body || item.summary || "");

    detailEl.innerHTML = `
      <div class="news-detail-split">
        <div class="news-detail-media">
          ${img || ""}
        </div>

        <div class="news-detail-content">
          <h3 class="news-detail-title">${title}</h3>
          ${date ? `<div class="news-detail-date">${date}</div>` : ""}
          <div class="news-detail-body">${body}</div>
        </div>
      </div>
    `;
  }

  function hideDetail() {
    if (!detailEl) return;
    detailEl.classList.add("is-hidden");
    detailEl.innerHTML = "";
  }

  function buildCard(item) {
    const title = escapeHtml(item.title || "");
    const date = escapeHtml(formatDate(item.date));
    const thumb = item.thumbnail ? `<img src="${escapeHtml(item.thumbnail)}" alt="${title}">` : "";
    const summary = escapeHtml(item.summary || "");

    const card = document.createElement("article");
    card.className = "news-card";
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="news-card-thumb">${thumb}</div>
      <div class="news-card-meta">
        <h4 class="news-card-title">${title}</h4>
        ${date ? `<div class="news-card-date">${date}</div>` : ""}
        ${summary ? `<div class="news-card-summary">${summary}</div>` : ""}
      </div>
    `;

    function onActivate() {
      const key = String(item.slug || item.title || "");
      // Toggle: clicking the same active card closes the detail panel.
      if (activeId === key) {
        setActiveCard(null);
        hideDetail();
        activeId = null;
        return;
      }

      activeId = key;
      setActiveCard(card);
      showDetail(item);
    }

    card.addEventListener("click", onActivate);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    });

    return card;
  }

  async function init() {
    if (!listEl || !emptyEl) return;

    // Start with detail hidden; it shows only after clicking.
    hideDetail();

    try {
      const res = await fetch(NEWS_JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch news.json: ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);

      if (!items.length) {
        emptyEl.style.display = "block";
        return;
      }

      emptyEl.style.display = "none";
      listEl.innerHTML = "";
      items.forEach((item) => listEl.appendChild(buildCard(item)));

    } catch (err) {
      console.error(err);
      emptyEl.style.display = "block";
      emptyEl.textContent = "Failed to load news posts.";
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
