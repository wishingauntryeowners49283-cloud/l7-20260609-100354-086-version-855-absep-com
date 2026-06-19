(function () {
    var mobileToggle = document.querySelector('[data-mobile-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function markMissingImage(image) {
        image.classList.add('poster-missing');
        image.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
            markMissingImage(image);
        });
    });

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFiltering() {
        var input = document.querySelector('[data-filter-input]');
        var category = document.querySelector('[data-filter-category]');
        var reset = document.querySelector('[data-filter-reset]');
        var count = document.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        if (!cards.length || (!input && !category)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-category'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var selectedCategory = normalize(category ? category.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var cardCategory = normalize(card.getAttribute('data-category'));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = !selectedCategory || cardCategory === selectedCategory;
                var shouldShow = matchQuery && matchCategory;

                card.classList.toggle('is-hidden-by-filter', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (category) {
            category.addEventListener('change', applyFilter);
        }

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (category) {
                    category.value = '';
                }
                applyFilter();
            });
        }

        applyFilter();
    }

    function setupPlayer() {
        var video = document.querySelector('.movie-player[data-hls-src]');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-hls-src');
        var overlay = document.querySelector('[data-play-button]');
        var hlsInstance = null;

        function prepareVideo() {
            if (video.getAttribute('data-player-ready') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute('data-player-ready', 'true');
        }

        function playVideo() {
            prepareVideo();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    setupHero();
    setupFiltering();
    setupPlayer();
})();
