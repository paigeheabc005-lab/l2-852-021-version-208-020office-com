(function () {
  function setupPlayer(card) {
    var video = card.querySelector('video[data-hls-src]');
    var overlay = card.querySelector('[data-player-overlay]');
    if (!video) {
      return;
    }

    var src = video.getAttribute('data-hls-src');
    var Hls = window.Hls;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove('is-hidden');
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = src;
        }
      });
      card.hlsInstance = hls;
    } else {
      video.src = src;
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        hideOverlay();
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(showOverlay);
        }
      });
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player-card]')).forEach(setupPlayer);
  });
}());
