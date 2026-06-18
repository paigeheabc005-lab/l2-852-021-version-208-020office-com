import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function setupBackToTop() {
  const button = $('[data-back-to-top]');

  if (!button) {
    return;
  }

  const toggle = () => {
    button.classList.toggle('is-visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  toggle();
}

function setupHeroCarousel() {
  const carousel = $('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = $$('[data-hero-slide]', carousel);
  const dots = $$('[data-hero-dot]', carousel);
  let current = 0;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === current));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === current));
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => show(Number(dot.dataset.heroDot || 0)));
  });

  if (slides.length > 1) {
    window.setInterval(() => show(current + 1), 5200);
  }
}

function setupMovieFilters() {
  $$('[data-filter-form]').forEach((form) => {
    const scope = form.parentElement || document;
    const cards = $$('[data-movie-card]', scope);
    const keywordInput = $('[data-filter-keyword]', form);
    const yearSelect = $('[data-filter-year]', form);
    const typeSelect = $('[data-filter-type]', form);
    const counter = $('[data-filter-count]', form);

    const apply = () => {
      const keyword = (keywordInput?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const type = typeSelect?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
        ].join(' ').toLowerCase();

        const cardYear = card.dataset.year || '';
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !year || cardYear === year || (year === '2022' && Number(cardYear) <= 2022);
        const matchType = !type || (card.dataset.type || '').includes(type);
        const show = matchKeyword && matchYear && matchType;

        card.classList.toggle('is-hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = `匹配 ${visible} 部`;
      }
    };

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('reset', () => window.setTimeout(apply, 0));
    apply();
  });
}

function movieCardTemplate(movie) {
  const tags = String(movie.tags || '').split(/[,，、/]+/).filter(Boolean).slice(0, 3).join(', ');

  return `
<a class="movie-card" href="${movie.url}" data-movie-card data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-region="${escapeHtml(movie.region)}" data-genre="${escapeHtml(movie.genre)}" data-tags="${escapeHtml(movie.tags)}">
  <div class="movie-card__poster">
    <figure class="poster-wrap poster-wrap--card" data-poster-label="${escapeHtml(String(movie.title || '').slice(0, 12))}">
      <img src="${movie.poster}" alt="${escapeHtml(movie.title)} 封面" loading="lazy" onerror="this.parentElement.classList.add('poster-missing'); this.remove();">
      <figcaption>${escapeHtml(movie.title)}</figcaption>
    </figure>
    <span class="movie-card__type">${escapeHtml(movie.type)}</span>
    <span class="movie-card__score">${escapeHtml(movie.score)}</span>
  </div>
  <div class="movie-card__body">
    <h3>${escapeHtml(movie.title)}</h3>
    <p>${escapeHtml(movie.one_line)}</p>
    <div class="movie-meta">
      <span>${escapeHtml(movie.year)}</span>
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.genre)}</span>
    </div>
    <div class="movie-tags">${escapeHtml(tags)}</div>
  </div>
</a>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupSearchPage() {
  const form = $('[data-search-page-form]');
  const input = $('[data-search-page-input]');
  const results = $('[data-search-page-results]');
  const meta = $('[data-search-page-meta]');

  if (!form || !input || !results) {
    return;
  }

  let index = [];

  const render = (query) => {
    const q = query.trim().toLowerCase();

    if (!q) {
      meta.textContent = '默认展示部分影片，输入关键词后将从完整索引中匹配。';
      return;
    }

    const matched = index.filter((movie) => {
      const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    }).slice(0, 96);

    results.innerHTML = matched.map(movieCardTemplate).join('') || '<div class="page-title-card"><h2>没有匹配结果</h2><p>可以尝试输入更短的关键词、地区、类型或年份。</p></div>';
    meta.textContent = `关键词“${query}”匹配到 ${matched.length} 部，最多显示前 96 部。`;
  };

  fetch(window.SEARCH_INDEX_URL || './assets/search-index.json')
    .then((response) => response.json())
    .then((data) => {
      index = Array.isArray(data) ? data : [];
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';

      if (q) {
        input.value = q;
        render(q);
      }
    })
    .catch(() => {
      meta.textContent = '搜索索引加载失败，请通过分类页继续浏览影片。';
    });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render(input.value || '');
  });

  input.addEventListener('input', () => render(input.value || ''));
}

function setupPlayers() {
  $$('video[data-hls-src]').forEach((video) => {
    const hlsSource = video.dataset.hlsSrc;

    if (!hlsSource) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(hlsSource);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSource;
    }
  });

  $$('[data-player-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const targetId = button.dataset.playerTarget;
      const video = targetId ? document.getElementById(targetId) : null;

      if (!video) {
        return;
      }

      try {
        button.classList.add('is-hidden');
        video.controls = true;
        await video.play();
      } catch (error) {
        button.classList.remove('is-hidden');
        button.textContent = '浏览器阻止自动播放，请再点一次';
      }
    });
  });
}

setupMobileMenu();
setupBackToTop();
setupHeroCarousel();
setupMovieFilters();
setupSearchPage();
setupPlayers();
