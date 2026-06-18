(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById("moviePlayer");
    var layer = document.querySelector("[data-player-start]");
    var errorBox = document.querySelector("[data-player-error]");
    var prepared = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add("is-visible");
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError("视频暂时无法播放");
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showError("请再次点击播放");
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
