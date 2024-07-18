import { doc, setDoc, getDocs, collection } from "firebase/firestore"; 
import { db } from "src/environments/environment";

var dbSavingInterval;

var localstorage = localStorage;
var uid = localstorage.getItem('uid');
var hls = new Hls();
export let levels;

export var windowResize = function() {
    window.addEventListener("resize",() => {
        if (window.innerWidth <= 480) {
            return 6;
          }
      
          else if (window.innerWidth > 480 && e.target.innerWidth <= 1024) {
            return 3;
          }
      
          else if(window.innerWidth > 1024) {
            return 2;
          }
    })
}

export var check = function(value) {
    if (Hls.isSupported()) {
        var video = document.getElementById('video');
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            // console.log('video and hls.js are now bound together !');
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        });
        hls.on(Hls.Events.LEVEL_SWITCHING, function (event, data) {
            // console.log(data);
        })
        
        detachMedia();
        video.removeAttribute('src');
        hls.loadSource(value);
        hls.attachMedia(video);
    }
    console.log('ready to play')
}

export var changeQuality = function(value, currentTime) {
    // ('#video').replaceWith($('#video').clone());
    if (Hls.isSupported()) {
        const maxDuration = document.getElementById("max-duration"); 
        const progressBar = document.querySelector("#myRange");
        const video = document.getElementById('video');

        const rewind = document.getElementById("rewindBtn");
        const forward = document.getElementById("forwardBtn");
        const loaderPanel = document.getElementById("loaderContainer");
        const progressMain = document.getElementById("progressMain")

        rewind.classList.add("alwaysHide");
        forward.classList.add("alwaysHide");
        progressMain.classList.add("alwaysHide");
        loaderPanel.classList.remove("loaderHidden");

        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            // console.log('video and hls.js are now bound together !');
        });
        hls.on(Hls.Events.MEDIA_DETACHED, function () {
            // console.log('Media Detatched');
        })
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            // console.log(
            // 'manifest loaded, found ' + data.levels.length + ' quality level',
            // );
        });
        hls.detachMedia();
        hls.loadSource(value);
        hls.attachMedia(video);
        video.currentTime = currentTime;

    }
}

export var detachMedia = function() {
    hls.on(Hls.Events.MEDIA_DETACHED, function () {
    })
    hls.detachMedia();
}


export var whilePlaying = function() {
    const video = document.getElementById("video");
    const progressBar = document.querySelector("#myRange");
    const currentTimeRef = document.getElementById("current-time"); 
    const maxDuration = document.getElementById("max-duration"); 
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

    video.addEventListener("waiting", () => {
        loaderPanel.classList.remove("loaderHidden");
    })

    video.addEventListener("playing", () => {
        loaderPanel.classList.add("loaderHidden");
    })

    video.addEventListener("timeupdate", () => { 
        const currentTime = video.currentTime;
        const percentage = currentTime;
        progressBar.max = video.duration;
        progressBar.value = percentage; 
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
    
    setInterval(() => { 
        currentTimeRef.innerHTML = timeFormatter(video.currentTime); 
        if (video.duration) {
            maxDuration.innerText = timeFormatter(video.duration); 
        }
    }, 1);
    
}

export var forward = function() {
    video.currentTime = video.currentTime + 20;
    hls.currentLevel = 3;
}

export var rewind = function() {
    video.currentTime = video.currentTime - 10;
    hls.currentLevel = 0;
}

export var nextAvailable = function() {
    const video = document.getElementById("video");
    var flag = false;
    video.addEventListener("timeupdate", () => { 
    if (video.currentTime >= video.duration - 60 && video.currentTime > 0) {
            if (!flag) {
                flag = true;
                playNext.classList.remove('playNextHidden');
                playNext.classList.add('playNext');
            }
        }

        else {
            playNext.classList.remove('playNext');
        playNext.classList.add('playNextHidden');
        }
    })
}

export var videoEnded = async function(data) {

    if (uid) {
        await setDoc(doc(db, uid, data.id), {
            details: {
                title: data.title,
                id: data.id,
                epNumber: data.number,
                lastTimestamp: 0,
                isFinished: true
            }
        })
    }
}

export var updateDb = function(data) {
    setVideocurrentTime(data);
    const video = document.getElementById("video");

    video.addEventListener('pause', async() => {
        if (uid) {
            await setDoc(doc(db, uid, data.id), {
                details: {
                    title: data.title,
                    id: data.id,
                    epNumber: data.number,
                    lastTimestamp: video.currentTime,
                    isFinished: false
                }
            })
        } 
    })

    video.addEventListener('ended', async() => {
        if (uid) {
            await setDoc(doc(db, uid, data.id), {
                details: {
                    title: data.title,
                    id: data.id,
                    epNumber: data.number,
                    lastTimestamp: video.currentTime,
                    isFinished: true
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