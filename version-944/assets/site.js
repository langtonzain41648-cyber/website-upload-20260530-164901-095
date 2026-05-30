(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = select('.mobile-toggle');
        var panel = select('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = panel.hasAttribute('hidden');
            if (isOpen) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function setupHero() {
        var root = select('[data-hero]');
        if (!root) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', root);
        var dots = selectAll('[data-hero-dot]', root);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        selectAll('[data-filter-bar]').forEach(function (bar) {
            var input = select('[data-filter-input]', bar);
            var year = select('[data-filter-year]', bar);
            var type = select('[data-filter-type]', bar);
            var reset = select('[data-filter-reset]', bar);
            var cards = selectAll('[data-card]');
            function fillSelect(selectElement, attr) {
                if (!selectElement || selectElement.children.length > 1) {
                    return;
                }
                var values = [];
                cards.forEach(function (card) {
                    var value = card.getAttribute(attr) || '';
                    if (value && values.indexOf(value) === -1) {
                        values.push(value);
                    }
                });
                values.sort().reverse().forEach(function (value) {
                    var option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    selectElement.appendChild(option);
                });
            }
            function readQuery() {
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q') || '';
                if (q && input && !input.value) {
                    input.value = q;
                }
            }
            function filter() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var t = type ? type.value : '';
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        ok = false;
                    }
                    if (t && card.getAttribute('data-type') !== t) {
                        ok = false;
                    }
                    card.classList.toggle('is-filter-hidden', !ok);
                });
            }
            fillSelect(year, 'data-year');
            fillSelect(type, 'data-type');
            readQuery();
            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', filter);
                    control.addEventListener('change', filter);
                }
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    filter();
                });
            }
            filter();
        });
    }

    window.initPlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !streamUrl) {
            return;
        }
        var loaded = false;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            load();
            if (button) {
                button.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
        load();
        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
