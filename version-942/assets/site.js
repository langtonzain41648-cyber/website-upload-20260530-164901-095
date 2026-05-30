(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle('is-active', currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle('is-active', currentIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupLocalFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]'));

    blocks.forEach(function (block) {
      var keywordInput = block.querySelector('[data-filter-keyword]');
      var yearSelect = block.querySelector('[data-filter-year]');
      var genreSelect = block.querySelector('[data-filter-genre]');
      var cards = Array.prototype.slice.call(block.querySelectorAll('[data-movie-card]'));
      var empty = block.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalizeText(keywordInput ? keywordInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var genre = genreSelect ? genreSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalizeText(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var cardGenre = card.getAttribute('data-genre') || '';
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (genre && cardGenre.indexOf(genre) === -1) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [keywordInput, yearSelect, genreSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
    });
  }

  function setupSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    if (!mount || !window.MOVIE_INDEX) {
      return;
    }

    var keywordInput = document.querySelector('[data-global-search]');
    var categorySelect = document.querySelector('[data-global-category]');
    var yearSelect = document.querySelector('[data-global-year]');
    var empty = document.querySelector('[data-search-empty]');

    function movieCard(movie) {
      return [
        '<article class="movie-card" data-movie-card>',
        '  <a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <div class="movie-poster">',
        '      <span class="movie-badge">' + escapeHtml(movie.type) + '</span>',
        '      <span class="rank-badge">' + escapeHtml(movie.year) + '</span>',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    </div>',
        '    <div class="movie-body">',
        '      <h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>',
        '      <div class="movie-info">',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.genre) + '</span>',
        '      </div>',
        '      <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function apply() {
      var keyword = normalizeText(keywordInput ? keywordInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var results = window.MOVIE_INDEX.filter(function (movie) {
        var text = normalizeText(movie.title + movie.region + movie.genre + movie.tags + movie.oneLine);
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (category && movie.category !== category) {
          return false;
        }
        if (year && movie.year !== year) {
          return false;
        }
        return true;
      }).slice(0, 120);

      mount.innerHTML = results.map(movieCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', results.length === 0);
      }
    }

    [keywordInput, categorySelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('[data-play-button]');
      var status = document.querySelector('[data-player-status]');
      var source = wrap.getAttribute('data-src');
      var hls = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initialize() {
        if (!video || !source) {
          setStatus('播放源暂不可用');
          return;
        }

        if (initialized) {
          return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function start() {
        initialize();
        var playPromise = video.play();
        wrap.classList.add('is-playing');
        setStatus('正在加载高清播放源');

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('请再次点击播放按钮开始播放');
            wrap.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
        video.addEventListener('playing', function () {
          wrap.classList.add('is-playing');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          wrap.classList.remove('is-playing');
        });
        video.addEventListener('error', function () {
          setStatus('播放源加载失败，可刷新页面后重试');
        });
      }
    });
  }

  setupHero();
  setupLocalFilters();
  setupSearchPage();
  setupPlayers();
})();
