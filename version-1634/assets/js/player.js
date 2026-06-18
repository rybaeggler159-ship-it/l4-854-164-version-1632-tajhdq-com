(() => {
  const configNode = document.querySelector('#player-config');
  const video = document.querySelector('#mainPlayer');
  const playLayer = document.querySelector('#playLayer');

  if (!configNode || !video || !playLayer) {
    return;
  }

  let config = {};
  let hls = null;
  let attached = false;

  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  const source = config.src;

  const hideLayer = () => {
    playLayer.classList.add('is-hidden');
  };

  const showLayer = () => {
    if (video.paused) {
      playLayer.classList.remove('is-hidden');
    }
  };

  const setFailure = () => {
    playLayer.classList.remove('is-hidden');
    playLayer.innerHTML = '<span class="play-orb">↻</span><strong>重新播放</strong>';
  };

  const beginPlayback = () => {
    if (!source) {
      return;
    }

    if (!attached) {
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(hideLayer).catch(() => {});
        });
        hls.on(window.Hls.Events.ERROR, (_, data) => {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setFailure();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setFailure();
        return;
      }
    }

    video.play().then(hideLayer).catch(() => {});
  };

  playLayer.addEventListener('click', beginPlayback);

  video.addEventListener('play', hideLayer);
  video.addEventListener('pause', showLayer);
  video.addEventListener('ended', showLayer);
  video.addEventListener('error', setFailure);

  video.addEventListener('click', () => {
    if (video.paused) {
      beginPlayback();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
})();
