(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(currentSlide + 1);
        }, 5600);
    }

    setSlide(0);

    var filterInput = document.querySelector('[data-filter-input]');
    var clearButton = document.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    function filterCards() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (clearButton && filterInput) {
        clearButton.addEventListener('click', function () {
            filterInput.value = '';
            filterCards();
            filterInput.focus();
        });
    }

    window.initPlayer = function (streamUrl) {
        var box = document.querySelector('[data-player]');
        if (!box) {
            return;
        }

        var video = box.querySelector('video');
        var cover = box.querySelector('[data-player-cover]');
        var errorBox = box.querySelector('[data-player-error]');
        var started = false;
        var hlsInstance = null;

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add('show');
            }
        }

        function attachStream() {
            if (started || !video) {
                return;
            }

            started = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        showError('视频暂时无法加载');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                showError('视频暂时无法加载');
            }
        }

        function startPlay() {
            attachStream();

            if (cover) {
                cover.classList.add('hide');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove('hide');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlay);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlay();
            } else {
                video.pause();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
