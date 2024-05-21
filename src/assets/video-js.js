import { ParseSourceFile } from "@angular/compiler";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { db } from "src/app/app.component";

var dbSavingInterval;

var localstorage = localStorage;
var uid = localstorage.getItem('uid');

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
    }
    console.log('ready to play')
}


export var whilePlaying = function() {
    const video = document.getElementById("video");
    const progressBar = document.querySelector(".progressBar");
    const currentTimeRef = document.getElementById("current-time"); 
    const maxDuration = document.getElementById("max-duration"); 
    const rewind = document.getElementById("rewindBtn");
    const forward = document.getElementById("forwardBtn");
    const loaderPanel = document.getElementById("loaderContainer");
    const playNext = document.getElementById("playNext");

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
    const video = document.getElementById("video");
    console.log(video.currentTime)
    console.log(uid)
    console.log(data)

    video.addEventListener('pause', async() => {
        const docRef = doc(db, "watchHistory", uid);
        const docSnap = await getDoc(docRef);

        console.log(data.title)
        console.log(docSnap.data().anime.name)
        if (docSnap.data().anime.name === data.title) {
            console.log('true');
        }

        else {
            console.log('false');
        }

        if (uid) {
            await setDoc(doc(db, "watchHistory", uid), {
                anime: {
                    name: data.title,
                    episode: {
                        id: data.id,
                        epNumber: data.number,
                        lastTimeStamp: video.currentTime
                    }
                }
            })
        }
    })

    // dbSavingInterval = setInterval(async () => {
    //     await setDoc(doc(db, "watchHistory", uid), {
    //         [data.title]: {
    //             [data.id]: {
    //                 epNumber: data.number,
    //                 lastTimeStamp: video.currentTime
    //             }
    //         }
    //     })
    //     checker = true;
    // }, 1000);

    // if(checker) {
    //     console.log('false');
    //     clearInterval(dbSavingInterval);
    //     checker = false;
    // }
}

export var dismissInterval = function() {
    clearInterval(dbSavingInterval);
}