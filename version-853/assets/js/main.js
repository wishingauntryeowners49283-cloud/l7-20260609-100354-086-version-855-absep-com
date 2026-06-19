(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var next = document.querySelector('[data-hero-next]');
  var prev = document.querySelector('[data-hero-prev]');
  var current = 0;

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

  if (slides.length) {
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-filter-input]');
  var region = document.querySelector('[data-filter-region]');
  var type = document.querySelector('[data-filter-type]');
  var year = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var keyword = normalize(input && input.value);
    var regionValue = normalize(region && region.value);
    var typeValue = normalize(type && type.value);
    var yearValue = normalize(year && year.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
        matched = false;
      }
      if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
        matched = false;
      }
      if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
        matched = false;
      }
      card.classList.toggle('is-hidden', !matched);
    });
  }

  [input, region, type, year].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && input) {
    input.value = query;
    filterCards();
  }
})();
