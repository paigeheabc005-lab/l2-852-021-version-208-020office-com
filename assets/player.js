(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movie-video");
    var startButton = document.getElementById("player-start");
    var configElement = document.getElementById("player-config");
    if (!video || !startButton || !configElement) {
      return;
    }

    var config = {};
    try {
      config = JSON.parse(configElement.textContent || "{}");
    } catch (error) {
      config = {};
    }

    var source = config.source || "";
    var attached = false;
    var hls = null;

    function attachVideo() {
      if (attached || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function beginPlay() {
      attachVideo();
      var playResult = video.play();
      startButton.classList.add("is-hidden");
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          startButton.classList.remove("is-hidden");
        });
      }
    }

    startButton.addEventListener("click", beginPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlay();
      }
    });
    video.addEventListener("play", function () {
      startButton.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        startButton.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
