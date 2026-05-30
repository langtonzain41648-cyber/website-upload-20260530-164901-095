(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
                document.body.classList.remove('menu-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function schedule() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                schedule();
            });
        });
        show(0);
        schedule();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        forms.forEach(function (form) {
            var scope = form.closest('main') || document;
            var input = form.querySelector('[data-search-input]');
            var category = form.querySelector('[data-category-filter]');
            var year = form.querySelector('[data-year-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-empty]');
            if (!cards.length) {
                return;
            }
            if (year && year.options.length <= 1) {
                var years = cards.map(function (card) {
                    return card.getAttribute('data-year') || '';
                }).filter(Boolean).filter(function (value, position, arr) {
                    return arr.indexOf(value) === position;
                }).sort().reverse();
                years.forEach(function (value) {
                    var option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    year.appendChild(option);
                });
            }
            var params = new URLSearchParams(window.location.search);
            if (input && params.get('q')) {
                input.value = params.get('q');
            }
            function apply() {
                var q = normalize(input ? input.value : '');
                var c = category ? category.value : '';
                var y = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.textContent
                    ].join(' '));
                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (c && card.getAttribute('data-category') !== c) {
                        matched = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    window.setupPlayer = function (streamUrl) {
        var video = document.getElementById('movieVideo');
        var cover = document.getElementById('playerCover');
        if (!video || !cover || !streamUrl) {
            return;
        }
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.controls = true;
        }
        function start() {
            attach();
            cover.classList.add('is-hidden');
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }
        cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
