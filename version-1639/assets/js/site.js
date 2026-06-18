(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function getCards() {
        return Array.from(document.querySelectorAll("[data-card-list] .movie-card, [data-card-list] .ranking-card"));
    }

    function filterCards(query, category) {
        var text = (query || "").trim().toLowerCase();
        var selected = category || "all";
        getCards().forEach(function (card) {
            var title = (card.getAttribute("data-title") || "").toLowerCase();
            var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
            var itemCategory = card.getAttribute("data-category") || "";
            var matchesText = !text || title.indexOf(text) > -1 || keywords.indexOf(text) > -1;
            var matchesCategory = selected === "all" || itemCategory === selected;
            card.classList.toggle("card-hidden", !(matchesText && matchesCategory));
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = !nav.classList.contains("open");
            nav.classList.toggle("open", open);
            button.classList.toggle("open", open);
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function setupSearch() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                event.preventDefault();
                var query = input.value.trim();
                var url = form.getAttribute("action") || "./search.html";
                window.location.href = query ? url + "?q=" + encodeURIComponent(query) : url;
            });
        });

        var liveInput = document.querySelector("[data-live-search]");
        var currentCategory = "all";
        var params = new URLSearchParams(window.location.search);
        if (liveInput && params.get("q")) {
            liveInput.value = params.get("q");
        }
        if (liveInput) {
            filterCards(liveInput.value, currentCategory);
            liveInput.addEventListener("input", function () {
                filterCards(liveInput.value, currentCategory);
            });
        }
        document.querySelectorAll("[data-filter]").forEach(function (button) {
            button.addEventListener("click", function () {
                currentCategory = button.getAttribute("data-filter") || "all";
                document.querySelectorAll("[data-filter]").forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                filterCards(liveInput ? liveInput.value : "", currentCategory);
            });
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        carousel.querySelector("[data-hero-prev]").addEventListener("click", function () {
            show(current - 1);
            restart();
        });
        carousel.querySelector("[data-hero-next]").addEventListener("click", function () {
            show(current + 1);
            restart();
        });
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        restart();
    }

    ready(function () {
        setupMenu();
        setupSearch();
        setupHero();
    });

    window.initMoviePlayer = function (streamUrl) {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector(".play-overlay");
        var hlsInstance = null;
        var loaded = false;

        function loadVideo() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }
            video.src = streamUrl;
            return Promise.resolve();
        }

        function startPlayback() {
            loadVideo().then(function () {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("hidden");
                        }
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
