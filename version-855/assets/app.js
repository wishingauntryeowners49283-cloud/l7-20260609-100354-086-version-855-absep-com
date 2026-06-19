(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".filter-form"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function () {
        applyFilter(form);
      });
      Array.prototype.slice.call(form.querySelectorAll("input, select")).forEach(function (field) {
        field.addEventListener("input", function () {
          applyFilter(form);
        });
        field.addEventListener("change", function () {
          applyFilter(form);
        });
      });
    });
  }

  function applyFilter(form) {
    var root = form.closest(".container") || document;
    var parent = root.parentElement || document;
    var list = parent.querySelector(".searchable-list") || document.querySelector(".searchable-list");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-card")) : [];
    var keyword = normalize(form.querySelector('[name="keyword"]'));
    var year = normalize(form.querySelector('[name="year"]'));
    var type = normalize(form.querySelector('[name="type"]'));

    cards.forEach(function (card) {
      var text = normalizeText(card.getAttribute("data-search") || card.textContent || "");
      var yearText = normalizeText(card.getAttribute("data-year") || card.textContent || "");
      var typeText = normalizeText(card.getAttribute("data-type") || card.textContent || "");
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && yearText.indexOf(year) === -1) {
        matched = false;
      }
      if (type && typeText.indexOf(type) === -1 && text.indexOf(type) === -1) {
        matched = false;
      }

      card.classList.toggle("is-filtered-out", !matched);
    });
  }

  function normalize(field) {
    return normalizeText(field ? field.value : "");
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var source = video ? video.querySelector("source") : null;
      var url = source ? source.getAttribute("src") : "";

      if (!video || !button || !url) {
        return;
      }

      function start() {
        attachStream(video, url);
        var playPromise = video.play();
        shell.classList.add("is-playing");

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", start);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove("is-playing");
        }
      });
    });
  }

  function attachStream(video, url) {
    if (video.dataset.ready === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.dataset.ready = "true";
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.dataset.ready = "true";
      return;
    }

    video.src = url;
    video.dataset.ready = "true";
  }
})();
