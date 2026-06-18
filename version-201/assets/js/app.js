(function () {
  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
  var hlsLoading = false;
  var hlsCallbacks = [];

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = hlsScriptUrl;
    script.async = true;
    script.onload = function () {
      hlsLoading = false;
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks = [];
      callbacks.forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks = [];
      callbacks.forEach(function (fn) {
        fn();
      });
    };
    document.head.appendChild(script);
  }

  function bindMobileNav() {
    var trigger = document.querySelector("[data-mobile-trigger]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!trigger || !nav) {
      return;
    }
    trigger.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      if (slides.length <= 1) {
        return;
      }
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          stop();
          show(dotIndex);
          start();
        });
      });
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function bindFilters() {
    var forms = document.querySelectorAll("[data-filter-form]");
    forms.forEach(function (form) {
      var targetSelector = form.getAttribute("data-target");
      var target = targetSelector ? document.querySelector(targetSelector) : document;
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
      function apply() {
        var formData = new FormData(form);
        var query = String(formData.get("q") || "").trim().toLowerCase();
        var year = String(formData.get("year") || "").trim();
        var type = String(formData.get("type") || "").trim();
        cards.forEach(function (card) {
          var text = String(card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            ok = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            ok = false;
          }
          card.hidden = !ok;
        });
      }
      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  function attachStream(video, source, onReady) {
    if (!source || video.dataset.boundSource === source) {
      onReady();
      return;
    }
    video.dataset.boundSource = source;
    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          onReady();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.src = source;
              onReady();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        onReady();
      } else {
        video.src = source;
        onReady();
      }
    });
  }

  function bindPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var source = player.getAttribute("data-src");
      if (!video || !button || !source) {
        return;
      }
      var start = function () {
        attachStream(video, source, function () {
          player.classList.add("is-playing");
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              video.controls = true;
            });
          }
        });
      };
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!video.dataset.boundSource) {
          start();
        }
      });
    });

    document.querySelectorAll("[data-watch-now]").forEach(function (button) {
      button.addEventListener("click", function () {
        var player = document.querySelector("[data-player]");
        if (!player) {
          return;
        }
        player.scrollIntoView({ behavior: "smooth", block: "center" });
        var overlay = player.querySelector(".play-overlay");
        if (overlay) {
          window.setTimeout(function () {
            overlay.click();
          }, 360);
        }
      });
    });
  }

  ready(function () {
    bindMobileNav();
    bindHero();
    bindFilters();
    bindPlayers();
  });
})();
