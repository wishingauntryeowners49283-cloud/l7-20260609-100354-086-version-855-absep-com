(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play]');
  var stream = video ? video.getAttribute('data-stream') : '';
  var hlsInstance = null;

  function prepare() {
    if (!video || !stream || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
    video.setAttribute('controls', 'controls');
  }

  function playMovie() {
    prepare();
    if (button) {
      button.classList.add('is-hidden');
    }
    if (video) {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener('click', playMovie);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        playMovie();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
