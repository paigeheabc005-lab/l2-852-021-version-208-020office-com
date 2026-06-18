(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-result]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
    var activeField = '';
    var activeValue = '';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-text') || '').toLowerCase();
        var matchesText = !query || searchText.indexOf(query) !== -1;
        var matchesChip = true;

        if (activeField && activeValue) {
          matchesChip = (card.getAttribute('data-' + activeField) || '').indexOf(activeValue) !== -1;
        }

        var visible = matchesText && matchesChip;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });

        if (chip.getAttribute('data-filter-value') === activeValue && chip.getAttribute('data-filter-field') === activeField) {
          activeField = '';
          activeValue = '';
        } else {
          chip.classList.add('is-active');
          activeField = chip.getAttribute('data-filter-field') || '';
          activeValue = chip.getAttribute('data-filter-value') || '';
        }

        applyFilter();
      });
    });

    applyFilter();
  });
})();
