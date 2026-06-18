(function () {
  function select(selector) {
    return document.querySelector(selector);
  }

  function initialize(options) {
    var video = select(options.selector);
    var button = select(options.buttonSelector);
    var source = options.source;
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
        return;
      }
      video.src = source;
    }

    function play() {
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function toggle() {
      if (video.paused) {
        play();
        return;
      }
      video.pause();
    }

    if (button) {
      button.addEventListener("click", function () {
        play();
      });
    }

    video.addEventListener("click", function () {
      if (button && !button.classList.contains("is-hidden")) {
        play();
        return;
      }
      toggle();
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.MoviePlayer = {
    initialize: initialize
  };
})();
