(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        document.querySelectorAll(".hero").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === active);
                });
            }

            function start() {
                if (timer || slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5000);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(active - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });

            show(0);
            start();
        });

        document.querySelectorAll(".listing-section").forEach(function (section) {
            var input = section.querySelector(".movie-search-input");
            var type = section.querySelector(".movie-type-filter");
            var region = section.querySelector(".movie-region-filter");
            var year = section.querySelector(".movie-year-filter");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card, .rank-row"));
            var empty = section.querySelector(".empty-state");

            function getText(card) {
                return [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var ok = true;
                    if (query && getText(card).indexOf(query) === -1) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }
                    if (regionValue && card.getAttribute("data-region") !== regionValue) {
                        ok = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("active", shown === 0);
                }
            }

            [input, type, region, year].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });
        });
    });

    window.setupVideo = function (source) {
        var video = document.getElementById("video-player");
        var overlay = document.querySelector(".player-overlay");
        var button = document.querySelector(".player-action");
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsPlayer = hls;
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function playVideo() {
            loadVideo();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                playVideo();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
    };
})();
