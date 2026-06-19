(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function text(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function startMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function startHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        restart();
      });
    });
    show(0);
    play();
  }

  function startCategoryFilter() {
    var form = document.getElementById('categoryFilterForm');
    var grid = document.getElementById('categoryMovieGrid');
    if (!form || !grid) {
      return;
    }
    var keyword = document.getElementById('filterKeyword');
    var region = document.getElementById('filterRegion');
    var type = document.getElementById('filterType');
    var sort = document.getElementById('filterSort');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = value(keyword);
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var sorted = cards.slice();
      if (sort && sort.value === 'oldest') {
        sorted.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      } else if (sort && sort.value === 'title') {
        sorted.sort(function (a, b) {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        });
      } else {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' ').toLowerCase();
        var matchedKeyword = !q || haystack.indexOf(q) !== -1;
        var matchedRegion = !selectedRegion || card.dataset.region === selectedRegion;
        var matchedType = !selectedType || card.dataset.type === selectedType;
        card.hidden = !(matchedKeyword && matchedRegion && matchedType);
      });
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + text(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card compact">' +
      '<a class="poster-link" href="' + text(item.url) + '" aria-label="' + text(item.title) + '">' +
      '<img src="' + text(item.cover) + '" alt="' + text(item.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-chip">立即观看</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + text(item.url) + '">' + text(item.title) + '</a></h3>' +
      '<p class="movie-meta">' + text(item.year) + ' · ' + text(item.region) + ' · ' + text(item.type) + '</p>' +
      '<p class="movie-line">' + text(item.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function startSearchPage() {
    var results = document.getElementById('searchResults');
    var summary = document.getElementById('searchSummary');
    var form = document.getElementById('searchPageForm');
    var input = document.getElementById('searchPageInput');
    if (!results || !summary || !form || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var q = input.value.trim().toLowerCase();
      var data = window.SEARCH_MOVIES;
      var matched = data.filter(function (item) {
        if (!q) {
          return true;
        }
        return [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          item.oneLine,
          (item.tags || []).join(' ')
        ].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      if (!q) {
        matched = data.slice(0, 60);
        summary.textContent = '推荐影片';
      } else if (matched.length) {
        summary.textContent = '相关影片';
      } else {
        summary.textContent = '没有找到相关影片';
      }
      results.innerHTML = matched.map(createSearchCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.history.replaceState({}, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    render();
  }

  ready(function () {
    startMobileMenu();
    startHero();
    startCategoryFilter();
    startSearchPage();
  });
}());
