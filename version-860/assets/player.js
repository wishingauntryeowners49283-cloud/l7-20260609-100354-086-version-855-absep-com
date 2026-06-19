(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    window.initMoviePlayer = function (config) {
        ready(function () {
            var video = document.getElementById(config.videoId);
            var cover = document.getElementById(config.coverId);
            var source = config.source;
            var attached = false;
            var instance = null;

            function attach() {
                if (attached || !video || !source) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    instance.loadSource(source);
                    instance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function start() {
                attach();
                if (cover) {
                    cover.classList.add("hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {
                        if (cover) {
                            cover.classList.remove("hidden");
                        }
                    });
                }
            }

            if (!video) {
                return;
            }
            attach();
            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (instance) {
                    instance.destroy();
                }
            });
        });
    };
})();
