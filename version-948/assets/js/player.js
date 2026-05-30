
(function () {
  function bindSource(video, source) {
    if (video.getAttribute("data-ready") === "true") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else {
      video.src = source;
    }
    video.setAttribute("data-ready", "true");
  }

  window.initMoviePlayer = function (videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function startPlayback() {
      bindSource(video, source);
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        hideOverlay();
        startPlayback();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        hideOverlay();
        startPlayback();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("loadedmetadata", function () {
      video.controls = true;
    });
  };
})();
