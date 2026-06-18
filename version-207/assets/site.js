(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var previous = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      var panel = scope.querySelector(".filter-panel");
      if (!panel) {
        return;
      }
      var searchInput = panel.querySelector(".filter-search");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
      var empty = scope.querySelector(".filter-empty");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
      }

      function matchesSelect(card, select) {
        var value = normalize(select.value);
        if (!value) {
          return true;
        }
        var key = select.getAttribute("data-filter");
        return normalize(card.getAttribute("data-" + key)) === value;
      }

      function applyFilters() {
        var query = searchInput ? normalize(searchInput.value) : "";
        var shown = 0;
        cards.forEach(function (card) {
          var searchableText = normalize(card.getAttribute("data-search"));
          var queryMatch = !query || searchableText.indexOf(query) !== -1;
          var selectMatch = selects.every(function (select) {
            return matchesSelect(card, select);
          });
          var visible = queryMatch && selectMatch;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
      applyFilters();
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
