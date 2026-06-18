(function () {
  "use strict";

  var libraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.7/dist/hls.min.js";
  var libraryTask = null;

  function loadLibrary(done) {
    if (window.Hls) {
      done();
      return;
    }
    if (libraryTask) {
      libraryTask.then(done).catch(done);
      return;
    }
    libraryTask = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = libraryUrl;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    libraryTask.then(done).catch(done);
  }

  function setStatus(element, text) {
    if (!element) {
      return;
    }
    element.textContent = text || "";
    element.classList.toggle("is-visible", Boolean(text));
  }

  function once(fn) {
    var called = false;
    return function () {
      if (called) {
        return;
      }
      called = true;
      fn();
    };
  }

  function init(config) {
    var video = document.querySelector(config.video);
    var button = document.querySelector(config.button);
    var overlay = document.querySelector(config.overlay);
    var status = document.querySelector(config.status);
    var stream = config.stream;
    var hls = null;
    var prepared = false;
    var preparing = false;

    if (!video || !stream) {
      return;
    }

    function prepare(done) {
      if (prepared) {
        done();
        return;
      }
      if (preparing) {
        window.setTimeout(function () {
          prepare(done);
        }, 120);
        return;
      }
      preparing = true;
      setStatus(status, "正在加载...");
      var finish = once(function () {
        prepared = true;
        preparing = false;
        setStatus(status, "");
        done();
      });

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        finish();
        return;
      }

      loadLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus(status, "播放暂时不可用");
            }
          });
        } else {
          video.src = stream;
          finish();
        }
      });
    }

    function start() {
      prepare(function () {
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var task = video.play();
        if (task && task.catch) {
          task.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    function toggle() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", toggle);
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
