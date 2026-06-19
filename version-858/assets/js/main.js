(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", nav.classList.contains("open"));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var picks = Array.prototype.slice.call(root.querySelectorAll("[data-hero-pick]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      picks.forEach(function (pick, i) {
        pick.classList.toggle("active", i === index);
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
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    picks.forEach(function (pick, i) {
      pick.addEventListener("mouseenter", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-card-list]") || document;
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    if (!input || !cards.length) {
      return;
    }
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (initialQuery) {
      input.value = initialQuery;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && String(card.dataset.region || "").toLowerCase() !== regionValue) {
          matched = false;
        }
        if (typeValue && String(card.dataset.type || "").toLowerCase() !== typeValue) {
          matched = false;
        }
        if (yearValue && String(card.dataset.year || "").toLowerCase() !== yearValue) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    input.addEventListener("input", apply);
    [region, type, year].forEach(function (select) {
      if (select) {
        select.addEventListener("change", apply);
      }
    });
    apply();
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      existing.addEventListener("error", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    script.dataset.hlsLoader = "true";
    script.addEventListener("load", callback, { once: true });
    script.addEventListener("error", callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayer() {
    var video = document.querySelector("[data-hls-video]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-src");
    var hls = null;
    var prepared = false;

    function setButtonHidden(hidden) {
      button.classList.toggle("is-hidden", hidden);
    }

    function attachSource(done) {
      if (prepared) {
        done();
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        done();
        return;
      }
      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            done();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              hls = null;
              video.src = source;
            }
          });
        } else {
          video.src = source;
          done();
        }
      });
    }

    function play() {
      attachSource(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setButtonHidden(false);
          });
        }
      });
    }

    button.addEventListener("click", function () {
      setButtonHidden(true);
      play();
    });
    video.addEventListener("play", function () {
      setButtonHidden(true);
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        setButtonHidden(false);
      }
    });
    video.addEventListener("ended", function () {
      setButtonHidden(false);
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        setButtonHidden(true);
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
