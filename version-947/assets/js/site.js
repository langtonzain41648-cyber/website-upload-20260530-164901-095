(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      body.classList.toggle('is-menu-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(scope, query) {
    var q = normalize(query);
    var cards = scope.querySelectorAll('[data-movie-card]');
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      card.classList.toggle('is-hidden', q && haystack.indexOf(q) === -1);
    });
  }

  document.querySelectorAll('[data-search]').forEach(function (input) {
    var scope = input.closest('[data-search-scope]') || document;
    input.addEventListener('input', function () {
      filterCards(scope, input.value);
    });
  });

  document.querySelectorAll('[data-filter-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      var scope = button.closest('[data-search-scope]') || document;
      var input = scope.querySelector('[data-search]');
      var value = button.getAttribute('data-filter-value') || '';
      scope.querySelectorAll('[data-filter-value]').forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      if (input) {
        input.value = value;
      }
      filterCards(scope, value);
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  var player = document.querySelector('[data-video-player]');
  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-trigger]');
    var source = player.getAttribute('data-source');
    var hlsReady = false;

    function setMessage(text) {
      if (overlay) {
        var label = overlay.querySelector('strong');
        if (label) {
          label.textContent = text;
        }
      }
    }

    function bindSource() {
      if (!video || !source || hlsReady) {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        hlsReady = true;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('当前视频暂时无法加载');
          }
        });
        hlsReady = true;
        return Promise.resolve();
      }

      setMessage('当前浏览器暂不支持播放');
      return Promise.reject(new Error('unsupported'));
    }

    function playVideo() {
      bindSource().then(function () {
        video.controls = true;
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        return video.play();
      }).catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  }
})();
