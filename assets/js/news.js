(function () {
  "use strict";

  // News content source (generated/managed by Decap CMS)
  const NEWS_JSON_URL = "/content/news.json";

  const gridEl = document.getElementById("news-grid");
  const emptyEl = document.getElementById("news-empty");

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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderBody(text) {
    // Keep it simple & safe: paragraphs + line breaks.
    const safe = escapeHtml(text || "");
    return safe
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function buildBox(item) {
    const title = escapeHtml(item.title || "");
    const date = escapeHtml(formatDate(item.date));
    const imgSrc = escapeHtml(item.thumbnail || "");
    const summary = escapeHtml(item.summary || "");
    const body = renderBody(item.body || "");

    // NOTE:
    // - We intentionally match the Home page DOM structure: .grid-style > div > .box
    // - main.js already binds click-to-toggle on `.box .clickable-image`
    //   and toggles `.box.active` (open/close with animation).

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="box">
        <div class="image fit clickable-image" role="button" tabindex="0" aria-label="Open news: ${title}">
          ${imgSrc ? `<img src="${imgSrc}" alt="${title}" />` : ""}
          <p>${title}</p>
        </div>
        <div class="content">
          <header class="align-center">
            ${date ? `<p>${date}</p>` : ""}
            <h2>${title}</h2>
          </header>
          ${summary ? `<p>${summary}</p>` : ""}
          ${body}
        </div>
      </div>
    `;

    // Accessibility: allow Enter/Space to trigger the same toggle as click.
    const clickable = wrap.querySelector(".clickable-image");
    if (clickable) {
      clickable.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickable.click();
        }
      });
    }

    return wrap;
  }

  async function init() {
    if (!gridEl || !emptyEl) return;

    try {
      const res = await fetch(NEWS_JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch news.json: ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : [];

      if (!items.length) {
        emptyEl.style.display = "block";
        gridEl.innerHTML = "";
        return;
      }

      emptyEl.style.display = "none";
      gridEl.innerHTML = "";

      items.forEach((item) => {
        gridEl.appendChild(buildBox(item));
      });
    } catch (err) {
      console.error(err);
      emptyEl.style.display = "block";
      emptyEl.textContent = "Failed to load news posts.";
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
