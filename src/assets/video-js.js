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
        hls.detachMedia();
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
    // video.play()
    console.log('ready to play')
}


export var whilePlaying = function() {
    console.log('true')
    const video = document.getElementById("video");
    const progressBar = document.querySelector(".progressBar");
    const currentTimeRef = document.getElementById("current-time"); 
    const maxDuration = document.getElementById("max-duration"); 

    const timeFormatter = (timeInput) => { 
        let minute = Math.floor(timeInput / 60); 
        minute = minute < 10 ? "0" + minute : minute; 
        let second = Math.floor(timeInput % 60); 
        second = second < 10 ? "0" + second : second; 
        return `${minute}:${second}`; 
    }; 

    video.addEventListener("timeupdate", () => { 
        const currentTime = video.currentTime; 
        const duration = video.duration; 
        const percentage = (currentTime / duration) * 100;
        console.log(percentage)
        progressBar.value = percentage; 

        //  min="1" max="100" value="50"
    });

    progressBar.oninput = function() {
        // progressBar.value  = (this.value / progressBar.clientWidth) * video.duration;
        video.currentTime = ((this.value / progressBar.clientWidth) * video.duration);
        progressBar.value = (video.currentTime / video.duration) * 100;
        console.log(video.currentTime)
      }
    
    setInterval(() => { 
        currentTimeRef.innerHTML = timeFormatter(video.currentTime); 
        maxDuration.innerText = timeFormatter(video.duration); 
    }, 1); 
    
}

// export var progressBarChange = function() {
//     const video = document.getElementById("video");
//     const playbackLine = document.querySelector(".playbackLine");
//     // playbackLine.addEventListener("click", (e) => { 
//     //     console.log('click registered')
//     //     let timelineWidth = playbackLine.clientWidth; 
//     //     video.currentTime = (e.offsetX / timelineWidth) * video.duration;
//     // });
// }