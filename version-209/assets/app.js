import { H as Hls } from './hls.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const setupMenu = () => {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
};

const setupHero = () => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  if (slides.length <= 1) return;
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  };
  prev?.addEventListener('click', () => {
    show(index - 1);
    restart();
  });
  next?.addEventListener('click', () => {
    show(index + 1);
    restart();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });
  restart();
};

const setupFilters = () => {
  const search = document.querySelector('[data-search-input]');
  const genre = document.querySelector('[data-genre-filter]');
  const cards = Array.from(document.querySelectorAll('.movie-card[data-search]'));
  if (!cards.length || (!search && !genre)) return;
  const apply = () => {
    const term = (search?.value || '').trim().toLowerCase();
    const genreValue = (genre?.value || '').trim();
    cards.forEach((card) => {
      const matchesTerm = !term || (card.dataset.search || '').includes(term);
      const matchesGenre = !genreValue || (card.dataset.genre || '').includes(genreValue);
      card.classList.toggle('is-hidden', !(matchesTerm && matchesGenre));
    });
  };
  search?.addEventListener('input', apply);
  genre?.addEventListener('change', apply);
};

const attachStream = (video, streamUrl) => {
  if (video.dataset.ready === 'true') return;
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    video.dataset.ready = 'true';
    video._hls = hls;
    return;
  }
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
    video.dataset.ready = 'true';
  }
};

const setupPlayers = () => {
  const shells = Array.from(document.querySelectorAll('.video-shell'));
  shells.forEach((shell) => {
    const video = shell.querySelector('video[data-m3u8]');
    const button = shell.querySelector('[data-play-button]');
    if (!video || !button) return;
    const play = () => {
      const streamUrl = video.dataset.m3u8 || '';
      if (!streamUrl) return;
      attachStream(video, streamUrl);
      button.hidden = true;
      video.controls = true;
      const start = () => video.play().catch(() => {
        button.hidden = false;
      });
      if (video.readyState >= 2) {
        start();
      } else {
        video.addEventListener('canplay', start, { once: true });
        window.setTimeout(start, 500);
      }
    };
    button.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) play();
    });
  });
};

ready(() => {
  setupMenu();
  setupHero();
  setupFilters();
  setupPlayers();
});
