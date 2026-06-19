(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
        showSlide(index);
        if (heroTimer) {
          clearInterval(heroTimer);
        }
        heroTimer = setInterval(function () {
          showSlide(activeSlide + 1);
        }, 5200);
      });
    });

    heroTimer = setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('.filter-input');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var currentFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var term = normalize(filterInput ? filterInput.value : '');

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var category = card.getAttribute('data-category') || '';
      var matchesText = !term || haystack.indexOf(term) !== -1;
      var matchesFilter = currentFilter === 'all' || category === currentFilter || haystack.indexOf(normalize(currentFilter)) !== -1;
      card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.search-form')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (form.querySelector('.filter-input')) {
        event.preventDefault();
        applyFilter();
      }
    });
  });

  function activatePlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-video');
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function start() {
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      video.setAttribute('controls', 'controls');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(activatePlayer);
})();
