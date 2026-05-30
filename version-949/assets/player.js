(function () {
  function initializePlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.js-player-cover');
    var message = box.querySelector('[data-player-message]');
    var stream = box.getAttribute('data-stream');
    var hls = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          showMessage('视频暂时无法播放');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        showMessage('视频暂时无法播放');
      }
    }

    function play() {
      loadStream();
      hideCover();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showMessage('点击播放器继续观看');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('play', hideCover);

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-video-player')).forEach(initializePlayer);
})();
