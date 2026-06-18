function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
    });
}

function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
        return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            show(index);
            start();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            show(current + 1);
            start();
        });
    }

    show(0);
    start();
}

function setupFiltering() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    inputs.forEach(function (input) {
        var targetSelector = input.getAttribute('data-filter-input');
        var target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }
        var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-filter-empty="' + targetSelector + '"]');
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var match = haystack.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        });
    });
}

function startPagePlayer(url) {
    var shell = document.querySelector('[data-player-box]');
    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');
    var hls = null;
    if (!shell || !video || !url) {
        return;
    }

    function attach() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
        video.setAttribute('data-ready', '1');
    }

    function play() {
        attach();
        shell.classList.add('is-playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
});
