(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var willOpen = menu.hasAttribute("hidden");
      if (willOpen) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(willOpen));
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-slide-to"));
        show(next);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initSearch() {
    var input = document.getElementById("searchInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .search-item"));
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function apply(value) {
      var q = String(value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-filtered-out", q && haystack.indexOf(q) === -1);
      });
    }
    input.addEventListener("input", function () {
      apply(input.value);
    });
    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll("[data-filter]").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        input.value = button.getAttribute("data-filter") || "";
        apply(input.value);
      });
    });
    apply(initial);
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".play-overlay");
      if (!video || !overlay) {
        return;
      }
      var started = false;
      function loadAndPlay() {
        if (!started) {
          started = true;
          var url = video.getAttribute("data-hls");
          video.setAttribute("controls", "controls");
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hls = hls;
          } else {
            video.src = url;
          }
        }
        overlay.classList.add("is-hidden");
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }
      overlay.addEventListener("click", loadAndPlay);
      video.addEventListener("click", function () {
        if (!started) {
          loadAndPlay();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
