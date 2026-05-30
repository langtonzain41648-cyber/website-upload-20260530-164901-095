(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.heroDot || "0"));
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    const searchPanel = document.querySelector("[data-search-panel]");
    const searchOpen = document.querySelector("[data-search-open]");
    const searchClose = document.querySelector("[data-search-close]");
    const searchInput = document.querySelector("[data-global-search]");
    const searchResults = document.querySelector("[data-search-results]");

    function openSearch() {
        if (!searchPanel) {
            return;
        }

        searchPanel.classList.add("is-open");

        if (searchInput) {
            window.setTimeout(function () {
                searchInput.focus();
            }, 30);
        }
    }

    function closeSearch() {
        if (searchPanel) {
            searchPanel.classList.remove("is-open");
        }
    }

    function renderSearch(query) {
        if (!searchResults) {
            return;
        }

        const source = window.SITE_MOVIES || [];
        const text = query.trim().toLowerCase();

        if (!text) {
            searchResults.innerHTML = "";
            return;
        }

        const list = source.filter(function (item) {
            return [
                item.title,
                item.region,
                item.type,
                String(item.year),
                item.genre,
                item.tags,
                item.line
            ].join(" ").toLowerCase().includes(text);
        }).slice(0, 24);

        if (!list.length) {
            searchResults.innerHTML = '<p class="filter-empty is-show">没有匹配的影片，请更换关键词。</p>';
            return;
        }

        searchResults.innerHTML = list.map(function (item) {
            return [
                '<a class="search-result" href="' + item.url + '">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span>',
                '<strong>' + escapeHtml(item.title) + '</strong>',
                '<span>' + escapeHtml(item.year + " · " + item.region + " · " + item.type) + '</span>',
                '</span>',
                '</a>'
            ].join("");
        }).join("");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    if (searchOpen) {
        searchOpen.addEventListener("click", openSearch);
    }

    if (searchClose) {
        searchClose.addEventListener("click", closeSearch);
    }

    if (searchPanel) {
        searchPanel.addEventListener("click", function (event) {
            if (event.target === searchPanel) {
                closeSearch();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            renderSearch(searchInput.value);
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSearch();
        }
    });

    const filterForm = document.querySelector("[data-filter-form]");
    const filterList = document.querySelector("[data-filter-list]");

    if (filterForm && filterList) {
        const cards = Array.from(filterList.querySelectorAll(".site-filter-card"));
        const keyword = filterForm.querySelector("[data-filter-keyword]");
        const region = filterForm.querySelector("[data-filter-region]");
        const type = filterForm.querySelector("[data-filter-type]");
        const year = filterForm.querySelector("[data-filter-year]");
        const empty = document.querySelector("[data-filter-empty]");

        function applyFilters() {
            const q = (keyword && keyword.value ? keyword.value : "").trim().toLowerCase();
            const r = region && region.value ? region.value : "";
            const t = type && type.value ? type.value : "";
            const y = year && year.value ? year.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const text = [
                    card.dataset.title || "",
                    card.dataset.region || "",
                    card.dataset.type || "",
                    card.dataset.year || "",
                    card.dataset.genre || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();

                const ok = (!q || text.includes(q))
                    && (!r || card.dataset.region === r)
                    && (!t || card.dataset.type === t)
                    && (!y || card.dataset.year === y);

                card.style.display = ok ? "" : "none";

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-show", visible === 0);
            }
        }

        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }
})();
