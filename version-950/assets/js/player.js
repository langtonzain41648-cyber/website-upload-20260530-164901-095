(function () {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    function setStatus(box, message) {
        const status = box.querySelector("[data-player-status]");

        if (status) {
            status.textContent = message || "";
        }
    }

    function startPlayer(box) {
        const video = box.querySelector("video[data-video-src]");
        const button = box.querySelector("[data-play-button]");

        if (!video) {
            return;
        }

        const src = video.dataset.videoSrc;

        if (!src) {
            setStatus(box, "播放源未绑定");
            return;
        }

        if (button) {
            button.classList.add("is-hidden");
        }

        setStatus(box, "正在连接播放源");

        if (video.dataset.ready === "1") {
            video.play().catch(function () {
                setStatus(box, "请再次点击播放");
            });
            return;
        }

        video.dataset.ready = "1";

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {
                    setStatus(box, "请再次点击播放");
                });
            }, { once: true });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus(box, "");
                video.play().catch(function () {
                    setStatus(box, "请再次点击播放");
                });
            });

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(box, "播放源连接异常");
                }
            });

            video._hls = hls;
            return;
        }

        video.src = src;
        video.play().then(function () {
            setStatus(box, "");
        }).catch(function () {
            setStatus(box, "当前浏览器需要 HLS 支持");
        });
    }

    players.forEach(function (box) {
        const button = box.querySelector("[data-play-button]");

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer(box);
            });
        }

        box.addEventListener("click", function (event) {
            if (event.target.closest("video")) {
                return;
            }

            startPlayer(box);
        });
    });
})();
