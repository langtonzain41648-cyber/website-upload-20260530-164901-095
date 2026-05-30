(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    document.querySelectorAll('[data-main-nav] a').forEach(function (link) {
        link.addEventListener('click', function () {
            body.classList.remove('nav-open');
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var categorySelect = panel.querySelector('[data-filter-category]');
        var status = panel.querySelector('[data-filter-status]');
        var cardList = panel.parentElement.querySelector('[data-card-list]');
        var cards = cardList ? Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]')) : [];
        var query = new URLSearchParams(window.location.search).get('q') || '';

        if (query && keywordInput) {
            keywordInput.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardMatches(card) {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags')
            ].join(' '));

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }
            if (year && card.getAttribute('data-year') !== year) {
                return false;
            }
            if (type && card.getAttribute('data-type') !== type) {
                return false;
            }
            if (category && card.getAttribute('data-category') !== category) {
                return false;
            }
            return true;
        }

        function applyFilter() {
            var visible = 0;
            cards.forEach(function (card) {
                var matched = cardMatches(card);
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (status) {
                status.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();
