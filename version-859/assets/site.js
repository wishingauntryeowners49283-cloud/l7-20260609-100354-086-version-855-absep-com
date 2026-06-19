(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var menuPanel = document.querySelector('[data-menu-panel]');

    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function () {
            menuPanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5800);
    }

    var resultBox = document.getElementById('search-results');
    var resultTitle = document.getElementById('search-title');
    var searchInput = document.getElementById('search-input');

    if (resultBox && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();

        if (searchInput) {
            searchInput.value = query;
        }

        if (!query) {
            resultBox.innerHTML = '<div class="empty-state">输入片名、类型、地区或标签，即可浏览相关影片。</div>';
            if (resultTitle) {
                resultTitle.textContent = '搜索影片';
            }
            return;
        }

        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var results = window.SEARCH_MOVIES.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
            return words.every(function (word) {
                return text.indexOf(word) !== -1;
            });
        }).slice(0, 120);

        if (resultTitle) {
            resultTitle.textContent = '搜索结果';
        }

        if (!results.length) {
            resultBox.innerHTML = '<div class="empty-state">暂未找到相关影片，试试更短的关键词。</div>';
            return;
        }

        resultBox.innerHTML = '<div class="movie-grid movie-grid-wide">' + results.map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a href="' + movie.link + '">',
                '<div class="poster-wrap">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                '<div class="badge-row"><span class="badge badge-hot">' + movie.year + '</span><span class="badge">' + escapeHtml(movie.type) + '</span></div>',
                '</div>',
                '<div class="card-body">',
                '<h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
                '<p class="card-desc">' + escapeHtml(movie.genre) + '</p>',
                '<div class="tag-list"><span class="tag">' + escapeHtml(movie.region) + '</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }).join('') + '</div>';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
