(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showSlide(0);
      startHero();
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(active - 1);
          startHero();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
          startHero();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startHero();
        });
      });
    }

    var searchInput = document.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var items = Array.prototype.slice.call(document.querySelectorAll(".search-item"));

    function fillSelect(field) {
      var select = document.querySelector('[data-filter-select="' + field + '"]');
      if (!select || select.options.length > 1) {
        return;
      }
      var values = [];
      items.forEach(function (item) {
        var value = item.getAttribute("data-" + field) || "";
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        return b.localeCompare(a, "zh-CN");
      });
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var filterValues = {};
      selects.forEach(function (select) {
        filterValues[select.getAttribute("data-filter-select")] = select.value;
      });
      items.forEach(function (item) {
        var text = item.getAttribute("data-search") || "";
        var matched = !query || text.indexOf(query) !== -1;
        Object.keys(filterValues).forEach(function (field) {
          var value = filterValues[field];
          if (value && item.getAttribute("data-" + field) !== value) {
            matched = false;
          }
        });
        item.classList.toggle("is-hidden", !matched);
      });
    }

    if (items.length) {
      fillSelect("year");
      fillSelect("region");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && searchInput) {
        searchInput.value = q;
      }
      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
      applyFilters();
    }
  });
})();
