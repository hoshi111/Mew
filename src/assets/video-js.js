export var check = function(value) {
    function makeLandscape() {
        // this works on android, not iOS
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape');
        }
      }

    if (Hls.isSupported()) {
        var video = document.getElementById('video');
        var hls = new Hls();
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log('video and hls.js are now bound together !');
        });
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            console.log(
            'manifest loaded, found ' + data.levels.length + ' quality level',
            );
        });
        hls.loadSource(value);
        hls.attachMedia(video);
    }
    // video.requestFullscreen()
    // if (video.mozRequestFullScreen) {
    //     video.mozRequestFullScreen();
    //     // makeLandscape();
    //   } else if (video.webkitRequestFullScreen) {
    //     video.webkitRequestFullScreen();
    //     // makeLandscape();
    //   }
    // window.screen.orientation.lock('landscape');
    video.play()
}