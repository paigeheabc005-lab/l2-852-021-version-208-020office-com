var cachedHlsConstructor = null;

async function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function getHlsConstructor() {
  if (cachedHlsConstructor) {
    return cachedHlsConstructor;
  }

  if (window.Hls) {
    cachedHlsConstructor = window.Hls;
    return cachedHlsConstructor;
  }

  try {
    var localModule = await import('./hls-vendor-bbsaiqh1.js');
    cachedHlsConstructor = localModule.H;
    return cachedHlsConstructor;
  } catch (localError) {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest');
      cachedHlsConstructor = window.Hls || null;
      return cachedHlsConstructor;
    } catch (remoteError) {
      return null;
    }
  }
}

async function startPlayer(wrapper) {
  var video = wrapper.querySelector('video');
  var overlay = wrapper.querySelector('[data-player-overlay]');
  var message = wrapper.querySelector('[data-player-message]');
  var source = wrapper.getAttribute('data-source');

  if (!video || !source) {
    if (message) {
      message.textContent = '当前页面缺少可播放地址。';
    }
    return;
  }

  if (message) {
    message.textContent = '正在加载播放源...';
  }

  try {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      await video.play();
    } else {
      var HlsConstructor = await getHlsConstructor();
      if (HlsConstructor && HlsConstructor.isSupported()) {
        var hls = new HlsConstructor({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            if (message) {
              message.textContent = '播放源已就绪，请再次点击播放按钮。';
            }
          });
        });
        hls.on(HlsConstructor.Events.ERROR, function (event, data) {
          if (data && data.fatal && message) {
            message.textContent = '播放源加载失败，请检查网络或更换浏览器。';
          }
        });
      } else {
        video.src = source;
        await video.play();
      }
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (message) {
      message.textContent = '播放中';
    }
  } catch (error) {
    if (message) {
      message.textContent = '播放启动失败，请检查浏览器自动播放设置或网络连接。';
    }
  }
}

document.querySelectorAll('[data-player]').forEach(function (wrapper) {
  var button = wrapper.querySelector('[data-play-button]');
  if (button) {
    button.addEventListener('click', function () {
      startPlayer(wrapper);
    });
  }
});
