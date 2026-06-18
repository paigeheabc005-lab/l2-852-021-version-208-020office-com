(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  document.querySelectorAll('[data-hero]').forEach(setupHero);

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(panel) {
    var scope = panel.closest('[data-filter-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var search = panel.querySelector('[data-filter-search]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var genre = panel.querySelector('[data-filter-genre]');
    var reset = panel.querySelector('[data-filter-reset]');
    var count = panel.querySelector('[data-filter-count]');
    var empty = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    if (search && params.get('q')) {
      search.value = params.get('q');
    }

    function matches(card) {
      var q = normalize(search && search.value);
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var genreValue = genre ? genre.value : '';
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));

      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (regionValue && card.dataset.region !== regionValue) {
        return false;
      }
      if (typeValue && card.dataset.type !== typeValue) {
        return false;
      }
      if (genreValue && normalize(card.dataset.genre).indexOf(normalize(genreValue)) === -1) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, type, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (genre) {
          genre.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(setupFilter);
})();
