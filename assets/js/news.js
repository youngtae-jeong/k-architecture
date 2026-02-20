document.addEventListener('DOMContentLoaded', () => {
  const newsListEl = document.getElementById('newsList');
  const newsDetailEl = document.getElementById('newsDetail');
  const newsLayoutEl = document.getElementById('newsLayout');

  if (!newsListEl || !newsDetailEl) return;

  // Start: show only the list. Detail appears after a click.
  hideDetail();

  fetch('content/news.json')
    .then(res => res.json())
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        newsListEl.innerHTML = '<p>No news posts yet.</p>';
        return;
      }
      renderList(items);
    })
    .catch(err => {
      console.error('Failed to load news.json', err);
      newsListEl.innerHTML = '<p>Failed to load news.</p>';
    });

  function hideDetail() {
    newsDetailEl.classList.add('is-hidden');
    if (newsLayoutEl) newsLayoutEl.classList.remove('has-detail');
    newsDetailEl.innerHTML = '';
  }

  function showDetail() {
    newsDetailEl.classList.remove('is-hidden');
    if (newsLayoutEl) newsLayoutEl.classList.add('has-detail');
  }

  function renderList(items) {
    newsListEl.innerHTML = items.map((item, idx) => {
      const title = item.title || 'Untitled';
      const date = item.date || '';
      const image = item.image || '';
      const excerpt = item.excerpt || '';
      return `
        <div class="news-card" data-idx="${idx}">
          ${image ? `<img src="${image}" alt="${escapeHtml(title)}" />` : ''}
          <div class="news-card-body">
            <h3>${escapeHtml(title)}</h3>
            ${date ? `<div class="news-date">${escapeHtml(date)}</div>` : ''}
            ${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    [...newsListEl.querySelectorAll('.news-card')].forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        const item = items[idx];
        if (!item) return;
        renderDetail(item);
        showDetail();
      });
    });
  }

  function renderDetail(item) {
    const title = item.title || '';
    const date = item.date || '';
    const image = item.image || '';
    const body = item.body || item.content || item.description || '';
    newsDetailEl.innerHTML = `
      <div class="news-detail-card">
        <h3>${escapeHtml(title)}</h3>
        ${date ? `<div class="news-date">${escapeHtml(date)}</div>` : ''}
        ${image ? `<img src="${image}" alt="${escapeHtml(title)}" />` : ''}
        ${body ? `<div class="news-body">${formatText(body)}</div>` : ''}
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatText(text) {
    // Turn newlines into paragraphs, keep it simple.
    const safe = escapeHtml(text);
    return safe
      .split(/\n{2,}/)
      .map(p => `<p>${p.replaceAll('\n', '<br/>')}</p>`)
      .join('');
  }
});
