(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initFallbackImages() {
    var images = document.querySelectorAll("img[data-fallback]");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.display = "none";
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  function initFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var count = scope.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && input) {
        input.value = query;
      }

      function getText(card) {
        return [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = getText(card);
          var matchesTerm = !term || text.indexOf(term) !== -1;
          var matchesRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
          var matchesType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
          var matchesYear = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
          var isVisible = matchesTerm && matchesRegion && matchesType && matchesYear;

          card.classList.toggle("is-hidden-by-filter", !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayer(sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var trigger = document.querySelector("[data-player-trigger]");
    var started = false;
    var hls = null;

    if (!video || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attachSource();
      video.controls = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    if (overlay && overlay !== trigger) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!started || video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    initMenu();
    initFallbackImages();
    initHero();
    initFilters();
  });

  window.SitePlayer = {
    init: initPlayer
  };
})();
