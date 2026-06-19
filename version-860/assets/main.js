(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function getRoot() {
        return document.body.getAttribute("data-root") || "./";
    }

    function setupMenus() {
        var button = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHeaderSearch() {
        selectAll("form[data-root]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                var root = form.getAttribute("data-root") || getRoot();
                window.location.href = root + "search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilterGrid() {
        var grid = document.querySelector(".filter-grid");
        if (!grid) {
            return;
        }
        var input = document.querySelector(".filter-input");
        var sort = document.querySelector(".sort-select");
        var cards = selectAll(".movie-card, .ranking-row", grid);
        function matches(card, keyword) {
            if (!keyword) {
                return true;
            }
            var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            return text.indexOf(keyword) !== -1;
        }
        function numberValue(card, name) {
            return parseFloat(card.getAttribute("data-" + name) || "0") || 0;
        }
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                card.classList.toggle("hidden-card", !matches(card, keyword));
            });
            if (sort) {
                var value = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (value === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    return numberValue(b, value) - numberValue(a, value);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (sort) {
            sort.addEventListener("change", apply);
        }
        apply();
    }

    function setupCategoryJump() {
        var select = document.querySelector(".category-jump");
        if (!select) {
            return;
        }
        select.addEventListener("change", function () {
            var root = select.getAttribute("data-root") || getRoot();
            window.location.href = root + "category/" + select.value + ".html";
        });
    }

    function cardTemplate(movie, root) {
        var tags = (movie.tags || []).slice(0, 4).join(" ");
        return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-search=\"" + escapeHtml(movie.searchText || "") + "\" data-year=\"" + movie.year + "\" data-rating=\"" + movie.rating + "\" data-views=\"" + movie.views + "\">" +
            "<a href=\"" + root + movie.url + "\" class=\"card-link\">" +
            "<div class=\"card-poster\"><img src=\"" + root + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" /><span class=\"card-badge\">" + escapeHtml(movie.category) + "</span><span class=\"card-duration\">" + escapeHtml(movie.duration) + "</span></div>" +
            "<div class=\"card-body\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"card-meta\"><span>" + movie.year + "</span><span>" + escapeHtml(movie.region) + "</span><span>★ " + movie.rating.toFixed(1) + "</span><span>" + formatViews(movie.views) + "</span></div><div class=\"card-tags\">" + escapeHtml(tags) + "</div></div>" +
            "</a></article>";
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function formatViews(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + "万";
        }
        return String(num);
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        if (!results || !input || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        var sort = document.getElementById("search-sort");
        function score(movie, keyword) {
            var text = (movie.searchText || "").toLowerCase();
            var title = (movie.title || "").toLowerCase();
            if (!keyword) {
                return 1;
            }
            var total = 0;
            keyword.split(/\s+/).forEach(function (part) {
                if (!part) {
                    return;
                }
                if (title.indexOf(part) !== -1) {
                    total += 5;
                }
                if (text.indexOf(part) !== -1) {
                    total += 2;
                }
            });
            return total;
        }
        function render() {
            var keyword = input.value.trim().toLowerCase();
            var items = window.MOVIE_INDEX.map(function (movie) {
                return {
                    movie: movie,
                    score: score(movie, keyword)
                };
            }).filter(function (item) {
                return keyword ? item.score > 0 : true;
            });
            var sortValue = sort ? sort.value : "match";
            items.sort(function (a, b) {
                if (sortValue === "year") {
                    return b.movie.year - a.movie.year;
                }
                if (sortValue === "views") {
                    return b.movie.views - a.movie.views;
                }
                if (sortValue === "rating") {
                    return b.movie.rating - a.movie.rating;
                }
                return b.score - a.score || b.movie.views - a.movie.views;
            });
            var root = getRoot();
            results.innerHTML = items.slice(0, 120).map(function (item) {
                return cardTemplate(item.movie, root);
            }).join("");
        }
        input.addEventListener("input", render);
        if (sort) {
            sort.addEventListener("change", render);
        }
        var form = document.querySelector(".search-page-form");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input.value.trim();
                var url = "search.html" + (value ? "?q=" + encodeURIComponent(value) : "");
                window.history.replaceState(null, "", url);
                render();
            });
        }
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenus();
        setupHeaderSearch();
        setupHero();
        setupFilterGrid();
        setupCategoryJump();
        setupSearchPage();
    });
})();
