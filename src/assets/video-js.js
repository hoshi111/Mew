import { doc, setDoc, getDocs, collection } from "firebase/firestore"; 
import { db } from "src/environments/environment";

var dbSavingInterval;

var localstorage = localStorage;
var uid = localstorage.getItem('uid');

// import { FFmpeg } from "/assets/ffmpeg/package/dist/esm/index.js";
// import { fetchFile } from "/assets/util/package/dist/esm/index.js";
// let ffmpeg = null;

// export const transcode = async (value) => {
// if (ffmpeg === null) {
//     ffmpeg = new FFmpeg();
//     await ffmpeg.load({
//     coreURL: "/assets/core/package/dist/esm/ffmpeg-core.js",
//     });
// }
// const name = value;
// await ffmpeg.writeFile(name, await fetchFile(value));
// message.innerHTML = 'Start transcoding';
// await ffmpeg.exec(['-i', name,  'output.mp4']);
// message.innerHTML = 'Complete transcoding';
// const data = await ffmpeg.readFile('output.mp4');

// console.log(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
// }

export var check = function(value) {
    if (Hls.isSupported()) {
        var video = document.getElementById('video');
        var hls = new Hls();
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            // console.log('video and hls.js are now bound together !');
        });
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            // console.log(
            // 'manifest loaded, found ' + data.levels.length + ' quality level',
            // );
        });
        video.removeAttribute('src');
        hls.loadSource(value);
        hls.attachMedia(video);
        console.log(video);
    }
    console.log('ready to play')
}


export var whilePlaying = function() {
    const video = document.getElementById("video");
    const progressBar = document.querySelector("#myRange");
    const currentTimeRef = document.getElementById("current-time"); 
    const maxDuration = document.getElementById("max-duration"); 
    const rewind = document.getElementById("rewindBtn");
    const forward = document.getElementById("forwardBtn");
    const loaderPanel = document.getElementById("loaderContainer");
    const overlayElements = document.getElementById("overlay");
    const btnID = document.getElementById("btnID");

    const timeFormatter = (timeInput) => { 
        let minute = Math.floor(timeInput / 60); 
        minute = minute < 10 ? "0" + minute : minute; 
        let second = Math.floor(timeInput % 60); 
        second = second < 10 ? "0" + second : second; 
        return `${minute}:${second}`; 
    };

    video.onwaiting = function() {
        loaderPanel.classList.remove("loaderHidden");
    }

    video.onplaying = function() {
        loaderPanel.classList.add("loaderHidden");
    }

    video.addEventListener("timeupdate", () => { 
        const currentTime = video.currentTime;
        const percentage = currentTime;
        progressBar.value = percentage; 
        progressBar.max = video.duration;
    });

    progressBar.oninput = function() {
        video.currentTime = this.value;
        progressBar.value = video.currentTime;
    }

    // for mobile
    progressBar.ontouchmove = function() {
        overlayElements.classList.remove("main-overlay-hidden", "fadeOut");
        overlayElements.classList.add("fadeIn");
        btnID.classList.add("hidePlayBtn");
        if (video.paused) {
            loaderPanel.classList.remove("loaderHidden");
        }
    }

    progressBar.ontouchend = function() {
        btnID.classList.remove("hidePlayBtn");
        overlayElements.classList.remove("fadeIn");
        overlayElements.classList.add("main-overlay-hidden", "fadeOut");

        if (video.paused) {
            loaderPanel.classList.add("loaderHidden");
        }
    }

    // for PC
    progressBar.onmousemove = function() {
        overlayElements.classList.remove("main-overlay-hidden", "fadeOut");
        overlayElements.classList.add("fadeIn");
        btnID.classList.add("hidePlayBtn");
        if (video.paused) {
            loaderPanel.classList.remove("loaderHidden");
        }
    }

    progressBar.onmouseout = function() {
        btnID.classList.remove("hidePlayBtn");
        overlayElements.classList.remove("fadeIn");
        overlayElements.classList.add("main-overlay-hidden", "fadeOut");

        if (video.paused) {
            loaderPanel.classList.add("loaderHidden");
        }
    }

    forward.onclick = function() {
        video.currentTime = video.currentTime + 20;
        progressBar.value = video.currentTime;
    }

    rewind.onclick = function() {
        video.currentTime = video.currentTime - 10;
        progressBar.value = video.currentTime;
    }
    
    setInterval(() => { 
        currentTimeRef.innerHTML = timeFormatter(video.currentTime); 
        maxDuration.innerText = timeFormatter(video.duration); 
    }, 1);
    
}

export var nextAvailable = function() {
    const video = document.getElementById("video");
    console.log(video.currentTime)
    video.addEventListener("timeupdate", () => { 
        console.log(video.currentTime)
    if (video.currentTime >= video.duration - 100) {
        playNext.classList.remove('playNextHidden');
        playNext.classList.add('playNext');
        }

        else {
            playNext.classList.remove('playnext');
        playNext.classList.add('playNextHidden');
        }
    })
}

export var updateDb = function(data) {
    setVideocurrentTime(data);
    const video = document.getElementById("video");
    console.log(video.currentTime)
    console.log(uid)
    console.log(data)

    video.addEventListener('pause', async() => {
        if (uid) {
            await setDoc(doc(db, uid, data.id), {
                details: {
                    title: data.title,
                    id: data.id,
                    epNumber: data.number,
                    lastTimestamp: video.currentTime
                }
            })
        } 
    })
}

export var setVideocurrentTime = async function(data) {
    let flag = false;
    const video = document.getElementById("video");

    const querySnapshot = await getDocs(collection(db, uid));
     querySnapshot.forEach(result => {
        if(data.id === result.id) {
            video.currentTime = result.data().details.lastTimestamp;
            flag = true;
        }
    });

    if (!flag) {
        video.currentTime = 0;
    }
}

export var dismissInterval = function() {
    clearInterval(dbSavingInterval);
}