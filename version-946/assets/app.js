(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function valueOf(element) {
    return element ? String(element.value || '').trim().toLowerCase() : '';
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var genre = panel.querySelector('[data-filter-genre]');
      var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-card]'));
      var empty = panel.querySelector('[data-empty-state]');

      if (panel.hasAttribute('data-query-from-url') && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      function apply() {
        var q = valueOf(input);
        var y = valueOf(year);
        var g = valueOf(genre);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchQuery = !q || text.indexOf(q) !== -1;
          var matchYear = !y || String(card.getAttribute('data-year') || '').toLowerCase().indexOf(y) !== -1;
          var matchGenre = !g || String(card.getAttribute('data-genre') || '').toLowerCase().indexOf(g) !== -1 || String(card.getAttribute('data-tags') || '').toLowerCase().indexOf(g) !== -1;
          var show = matchQuery && matchYear && matchGenre;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-player-start]');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !video || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        load();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function setupBacktop() {
    var button = document.querySelector('[data-backtop]');
    if (!button) {
      return;
    }
    function toggle() {
      button.classList.toggle('is-visible', window.scrollY > 360);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupBacktop();
  });
})();
