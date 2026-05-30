(function () {
    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('hls load failed'));
            };
            document.head.appendChild(script);
        });
    }

    function playVideo(video, button, panel, source) {
        if (!video || !source) {
            return;
        }

        var begin = function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (button) {
            button.classList.add('is-hidden');
        }
        if (panel) {
            panel.classList.add('is-playing');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== source) {
                video.src = source;
            }
            begin();
            return;
        }

        loadHlsLibrary().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                if (video._movieHls) {
                    video._movieHls.destroy();
                }
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video._movieHls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, begin);
            }
        }).catch(function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var panel = document.getElementById(config.panelId);
        var source = config.source;

        if (!video || !button || !source) {
            return;
        }

        button.addEventListener('click', function () {
            playVideo(video, button, panel, source);
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo(video, button, panel, source);
            }
        });

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
    };
})();
