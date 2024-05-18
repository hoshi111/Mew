import { ParseSourceFile } from "@angular/compiler";

export var check = function(value) {
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
        video.removeAttribute('src');
        hls.loadSource(value);
        hls.attachMedia(video);
    }
    console.log('ready to play')
}


export var whilePlaying = function() {
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
        console.log(video.currentTime);
        const percentage = currentTime;
        progressBar.value = percentage; 
        progressBar.max = video.duration;
    });

    progressBar.oninput = function() {
        video.currentTime = this.value;
        progressBar.value = video.currentTime;
        console.log(this.value)
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