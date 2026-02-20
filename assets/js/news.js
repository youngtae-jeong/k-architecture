/*
  K-Architecture News
  - Reads content/news.json (generated/updated by Decap CMS)
  - Renders a vertical, centered list of cards
  - Shows the detail panel ONLY after clicking a card
*/

(async function () {
  const listEl = document.getElementById('newsList');
  const detailEl = document.getElementById('newsDetail');
  const layoutEl = document.getElementById('newsLayout');

  if (!listEl || !detailEl || !layoutEl) return;

  const escapeHtml = (s) => (s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[c]));

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const showEmpty = () => {
    listEl.innerHTML = '<p class="news-empty">No news posts yet.</p>';
    detailEl.classList.add('is-hidden');
    layoutEl.classList.remove('has-detail');
    detailEl.innerHTML = '';
  };

  try {
    const res = await fetch('/content/news.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load news.json');

    /** @type {{title:string,date?:string,thumbnail?:string,image?:string,summary?:string,content?:string,body?:string,slug?:string}[]} */
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      showEmpty();
      return;
    }

    // Newest first (by date), fallback keeps original order.
    posts.sort((a, b) => {
      const ad = a?.date ? new Date(a.date).getTime() : 0;
      const bd = b?.date ? new Date(b.date).getTime() : 0;
      return bd - ad;
    });

    const renderDetail = (post) => {
      const title = escapeHtml(post?.title || '');
      const date = escapeHtml(formatDate(post?.date));
      const image = post?.image || post?.thumbnail || '';
      const summary = post?.summary || '';
      const content = post?.content || post?.body || '';

      detailEl.innerHTML = `
        <h3>${title}</h3>
        ${date ? `<p class="meta">${date}</p>` : ''}
        ${image ? `<img src="${escapeHtml(image)}" alt="${title}" />` : ''}
        ${summary ? `<p>${escapeHtml(summary)}</p>` : ''}
        ${content ? `<div class="news-content">${content}</div>` : ''}
      `;

      detailEl.classList.remove('is-hidden');
      layoutEl.classList.add('has-detail');
    };

    // Build cards
    listEl.innerHTML = '';

    posts.forEach((post, idx) => {
      const title = escapeHtml(post?.title || 'Untitled');
      const date = escapeHtml(formatDate(post?.date));
      const thumb = post?.thumbnail || post?.image || '';

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'news-card';
      card.setAttribute('aria-label', `Open news: ${title}`);

      card.innerHTML = `
        ${thumb ? `<img src="${escapeHtml(thumb)}" alt="${title}" />` : ''}
        <div class="pad">
          <p class="title">${title}</p>
          ${date ? `<p class="meta">${date}</p>` : ''}
        </div>
      `;

      card.addEventListener('click', () => {
        // Highlight active card
        listEl.querySelectorAll('.news-card.is-active').forEach((el) => el.classList.remove('is-active'));
        card.classList.add('is-active');
        renderDetail(post);
      });

      // Keyboard support (Enter/Space already works for <button>)
      listEl.appendChild(card);

      // Auto-open first item on large screens? No—user asked click-to-show.
      if (idx === 0) {
        // Keep detail hidden until click.
      }
    });

    // Start with no detail shown.
    detailEl.classList.add('is-hidden');
    layoutEl.classList.remove('has-detail');

  } catch (err) {
    console.error(err);
    showEmpty();
  }
})();
