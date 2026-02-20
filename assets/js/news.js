// News loader for K.Architecture (static JSON generated at build time)
//
// Data source: /content/news.json
// - If you use Decap CMS (/admin), news posts are saved in /content/news/*.md
// - Netlify build script converts those markdown files into /content/news.json

(async function () {
  const listEl = document.getElementById("newsList");
  const detailEl = document.getElementById("newsDetail");
  if (!listEl || !detailEl) return;

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));
  }

  function renderList(items) {
    if (!items.length) {
      listEl.innerHTML = '<p class="news-hint">No news yet.</p>';
      return;
    }

    listEl.innerHTML = items.map((item) => `
      <div class="news-card" data-slug="${escapeHtml(item.slug)}">
        ${item.thumbnail ? `<img src="${escapeHtml(item.thumbnail)}" alt="">` : ""}
        <div class="pad">
          <p class="title">${escapeHtml(item.title)}</p>
          <p class="meta">${escapeHtml((item.date || "").slice(0, 10))}</p>
          ${item.summary ? `<p class="meta">${escapeHtml(item.summary)}</p>` : ""}
        </div>
      </div>
    `).join("");

    listEl.onclick = (e) => {
      const card = e.target.closest(".news-card");
      if (!card) return;
      const slug = card.getAttribute("data-slug");
      const item = items.find((x) => x.slug === slug);
      if (item) renderDetail(item);
    };
  }

  function renderDetail(item) {
    const date = (item.date || "").slice(0, 10);
    // Display markdown as plain text (simple, safe). If you want rich markdown later, we can add a renderer.
    detailEl.innerHTML = `
      <h3 style="margin:0 0 6px;">${escapeHtml(item.title)}</h3>
      ${date ? `<div style="opacity:.7; margin-bottom:10px;">${escapeHtml(date)}</div>` : ""}
      ${item.thumbnail ? `<div style="margin:0 0 10px;"><img src="${escapeHtml(item.thumbnail)}" alt="" style="width:100%; border-radius:10px;"></div>` : ""}
      <div style="line-height:1.7; white-space:pre-wrap;">${escapeHtml(item.body || "")}</div>
    `;
  }

  try {
    const res = await fetch("/content/news.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load /content/news.json");
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    renderList(items);
    if (items[0]) renderDetail(items[0]);
  } catch (err) {
    listEl.innerHTML = '<p class="news-hint">News data not found. If you deploy with Netlify + CMS, make sure the build script generates <code>/content/news.json</code>.</p>';
  }
})();
