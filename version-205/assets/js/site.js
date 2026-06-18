(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function fillSelectOptions(scope, key) {
    var select = $('[data-filter-key="' + key + '"]', scope);
    if (!select) {
      return;
    }

    var values = new Set();
    $all('[data-movie-card]', scope).forEach(function (card) {
      var value = card.getAttribute('data-' + key);
      if (value) {
        values.add(value);
      }
    });

    Array.from(values).sort(function (a, b) {
      return b.localeCompare(a, 'zh-Hans-CN');
    }).forEach(function (value) {
      var optionExists = $all('option', select).some(function (option) {
        return option.value === value;
      });
      if (!optionExists) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      }
    });
  }

  function setupFilters() {
    $all('.js-filter-scope').forEach(function (scope) {
      var input = $('[data-search-input]', scope);
      var selects = $all('[data-filter-select]', scope);
      var reset = $('[data-filter-reset]', scope);
      var count = $('[data-result-count]', scope);
      var empty = $('[data-empty-state]', scope);
      var cards = $all('[data-movie-card]', scope);

      ['region', 'year', 'type'].forEach(function (key) {
        fillSelectOptions(scope, key);
      });

      function normalized(value) {
        return String(value || '').trim().toLowerCase();
      }

      function cardMatches(card) {
        var query = normalized(input ? input.value : '');
        var haystack = normalized([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }

        return selects.every(function (select) {
          var key = select.getAttribute('data-filter-key');
          var value = normalized(select.value);
          if (!value) {
            return true;
          }
          return normalized(card.getAttribute('data-' + key)) === value;
        });
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var matched = cardMatches(card);
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
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

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          selects.forEach(function (select) {
            select.value = '';
          });
          apply();
        });
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
}());
