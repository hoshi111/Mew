import { Attribute, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild, } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { ApiService } from '../api/api.service';
import { Subscription, interval } from 'rxjs';
import { check, whilePlaying, nextAvailable, updateDb, dismissInterval, videoEnded, setVideocurrentTime, rewind, forward, changeQuality } from 'src/assets/video-js' ;
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { Location } from "@angular/common";

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  @Input() state: any;
  public subscription: any = Subscription;
  localstorage = localStorage
  videoURL: any;

  overlayElements!: HTMLElement;
  rewindBtn!: HTMLElement;
  forwardBtn!: HTMLElement;
  progressMain!: HTMLElement;
  loaderPanel!: HTMLElement;
  videoContainer!: HTMLElement;
  maxDuration!: HTMLElement;
  qualityContainer!: HTMLElement;
  mainContent!: HTMLElement;
  volumeContainer!: HTMLElement;
  progressBar: any;
  volumeBar: any;


  isFullscreen: boolean = false;
  timeoutDelay: any;
  data: any = [];
  newData: any = [];
  trustedVideoUrl: SafeResourceUrl | undefined;
  value: any;
  sub: any;
  info: any;
  interval: any;
  icon_name: string = 'play';
  currentVideo: any;
  duration: any;
  endpoint: any;
  displayTitle: any;
  isPlaying: boolean = false;
  btn: any;
  fsUpdate: any;
  i = 0;
  isLoaded: boolean = false;
  isNextVideo: boolean = false;
  isAndroid = false;
  fsIcon = 'expand';
  quality = 'Auto';
  lastTime: number = 0;
  volumeIcon = 'volume-high';
  tempVol: any = 0.5;

  alertInputs: any = {values: []};

  constructor(private activatedRoute: ActivatedRoute,
              public navCtrl: NavController,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private router: Router,
              private platform: Platform,
              private location: Location
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack();
    });
  }

  ngOnInit() {
    if (this.platform.is('android')) {
      this.isAndroid = true;
    }
  }

  ionViewWillEnter() {
    this.btn = document.getElementById('playNext');
    this.currentVideo = document.getElementById("video");
    this.currentVideo.removeAttribute('src');
    const value = this.activatedRoute.snapshot.queryParamMap.get('value');
    if (this.isAndroid) {
      ScreenOrientation.lock({ orientation: "landscape-primary" });
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.hide();
      this.interval = setInterval(async () => {
        if (this.info = await StatusBar.getInfo()) {
          if (this.info.visible) { 
            await StatusBar.hide(); 
          }
        }  
      }, 2000);
    }

    if (!this.isLoaded) {
      if (value) {
        const idSplitted = (JSON.parse(value)).split("-");

        let videoId = '';

        for (let i = 0; i < idSplitted.length; i++) {
          if (idSplitted[i] != 'episode') {
            videoId = videoId + idSplitted[i] + '-';
          }

          if (idSplitted[i] == 'episode') {
            i = idSplitted.length
          }
        }

        videoId = videoId?.slice(0, -1);

        this.gogoAnimeGetDetails(videoId).then((result: any) => {
          this.data = result.episodes[idSplitted[idSplitted.length-1] - 1];
          this.data['title'] = result.title;
          this.data['image'] = result.image;

          this.setLink();

          this.nextVideo().then(() => {
            nextAvailable();
          })
        })
      }
      else {
        console.error('No data');
        this.goBack();
      }
    }
    
    this.overlayElements = document.getElementById('overlay') as HTMLDivElement;
    this.rewindBtn = document.getElementById('rewindBtn') as HTMLDivElement;
    this.forwardBtn = document.getElementById('forwardBtn') as HTMLDivElement;
    this.progressMain = document.getElementById('progressMain') as HTMLDivElement;
    this.loaderPanel  = document.getElementById('loaderContainer') as HTMLDivElement;
    this.videoContainer = document.getElementById('videoContainer') as HTMLDivElement;
    this.maxDuration = document.getElementById('max-duration') as HTMLElement;
    this.progressBar = document.querySelector('#myRange');
    this.volumeBar = document.querySelector('#volumeRange');
    this.volumeContainer = document.getElementById('volumeContainer') as HTMLElement;
    this.qualityContainer = document.getElementById('qualityContainer') as HTMLElement;
    this.mainContent = document.getElementById('mainContent') as HTMLElement;

    this.volumeBar.value = this.localstorage.getItem('volumeLevel');
    this.changeVolumeIcon(this.volumeBar.value);
    this.resetIdleTimer();
  }

  @HostListener('document:keydown', ['$event'])

  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key == ' ') {
      this.playPauseVideo();
    }
    
    else if (event.key == 'ArrowLeft') {
      this.rewindVideo();
    }

    else if (event.key == 'ArrowRight') {
      this.forwardVideo();
    }

    else if (event.key == 'Escape') {
      if (this.isFullscreen) {
        this.fullscreenEvent();
      }
    }
  }

  onMouseMove(e: any) {
   if (e) {
    this.overlayElements?.classList.remove('fadeIn');
    this.overlayElements?.classList.add('main-overlay-hidden', 'fadeOut');
    this.toggleOverlayByUser();
   }
  }

  async changeQuality() {
    let playing = false;

    if (!this.currentVideo.paused) {
      playing = true;
    }

    this.isPlaying = false;
    this.currentVideo.pause();
    await this.playVideo(this.data.id).then((result: any) => {
      this.lastTime = this.currentVideo.currentTime;
      result.sources.forEach((value: any) => {
          if (value.quality == this.quality) {
            this.videoURL = value.url;
            this.trustedVideoUrl = value.url;
            changeQuality(this.trustedVideoUrl, this.lastTime);
          }
          this.loaderPanel.classList.add("loaderHidden");
        })
    })
    if (playing) {
      this.currentVideo.play().then(() => {
        this.rewindBtn.classList.remove("alwaysHide");
        this.forwardBtn.classList.remove("alwaysHide");
        this.progressMain.classList.remove("alwaysHide");
      })
    }
  }

  setLink() {
    this.isLoaded = true;
    this.displayTitle = this.data.title + ' | Episode ' + this.data.number;

    this.playVideo(this.data.id).then((result: any) => {
      result.sources.forEach((value: any) => {

          if (value.quality != 'backup') {
            let q = value.quality;
            if (q == 'default') {
              this.alertInputs.values.push({'value': 'Auto'})
            }
            // alert('true')
            else {
              this.alertInputs.values.push({'value': q})
            }
          }

        if (value.quality == 'default') {
          this.alertInputs.values = this.alertInputs.values.reverse();

          this.alertInputs.values.forEach((value: any) => {
            if (value == 'Auto') {
              const quality = document.getElementById(value) as HTMLElement;
              quality?.setAttribute('checked','true')
            }
          })
          this.videoURL = value.url;
          this.trustedVideoUrl = value.url;
          check(this.trustedVideoUrl);
          whilePlaying();
        }
      })
    }).then(() => {
      let created = false;
      if (this.localstorage.getItem('isFullscreen') == 'true') {
        this.playPauseVideo();
        this.toggleFullscreen();
      }
    })
  }

  public toggleOverlayByUser() {
    this.overlayElements?.classList.remove('fadeOut');

    this.resetIdleTimer();
    
    if (this.overlayElements?.classList.contains('main-overlay-hidden')) {
        this.overlayElements?.classList.remove('main-overlay-hidden');
        this.overlayElements?.classList.add('fadeIn');
    }

    else {
      this.overlayElements?.classList.remove('fadeIn');
      this.overlayElements?.classList.add('main-overlay-hidden', 'fadeOut');
    }
  }

  // public ngAfterViewInit() {
    
  //   this.btn = document.getElementById('playNext');
  //   this.currentVideo = document.getElementById("video");
  //   this.currentVideo.removeAttribute('src');
  //   const value = this.activatedRoute.snapshot.queryParamMap.get('value');
  //   if (this.isAndroid) {
  //     ScreenOrientation.lock({ orientation: "landscape-primary" });
  //     StatusBar.setOverlaysWebView({ overlay: true });
  //     StatusBar.hide();
  //     this.interval = setInterval(async () => {
  //       if (this.info = await StatusBar.getInfo()) {
  //         if (this.info.visible) { 
  //           await StatusBar.hide(); 
  //         }
  //       }  
  //     }, 2000);
  //   }

  //   if (!this.isLoaded) {
  //     if (value) {
  //       const idSplitted = (JSON.parse(value)).split("-");
  //       console.log(idSplitted);

  //       let videoId = '';

  //       for (let i = 0; i < idSplitted.length; i++) {
  //         if (idSplitted[i] != 'episode') {
  //           videoId = videoId + idSplitted[i] + '-';
  //         }

  //         if (idSplitted[i] == 'episode') {
  //           i = idSplitted.length
  //         }
  //       }

  //       videoId = videoId?.slice(0, -1);

  //       console.log(videoId)

  //       this.gogoAnimeGetDetails(videoId).then((result: any) => {
  //         console.log(idSplitted[idSplitted.length-1])
  //         this.data = result.episodes[idSplitted[idSplitted.length-1] - 1];
  //         console.log(this.data)
  //         this.data['title'] = result.title;
  //         this.data['image'] = result.image;

  //         this.setLink();

  //         this.nextVideo().then(() => {
  //           nextAvailable();
  //         })
  //       })
  //     }
  //     else {
  //       console.error('No data');
  //       this.goBack();
  //     }
  //   }
    
  //   this.overlayElements = document.getElementById('overlay') as HTMLDivElement;
  //   this.rewindBtn = document.getElementById('rewindBtn') as HTMLDivElement;
  //   this.forwardBtn = document.getElementById('forwardBtn') as HTMLDivElement;
  //   this.progressMain = document.getElementById('progressMain') as HTMLDivElement;
  //   this.loaderPanel  = document.getElementById('loaderContainer') as HTMLDivElement;
  //   this.videoContainer = document.getElementById('videoContainer') as HTMLDivElement;
  //   this.maxDuration = document.getElementById('max-duration') as HTMLElement;
  //   this.progressBar = document.querySelector('#myRange');
  //   this.qualityContainer = document.getElementById('qualityContainer') as HTMLElement;


  //   this.resetIdleTimer();
  // }

  public resetIdleTimer()
  {
    clearTimeout(this.timeoutDelay);
    this.timeoutDelay = setTimeout(() => {
      if (!this.overlayElements?.classList.contains('main-overlay-hidden')) {
        // Ideally either both controls will be shown or not shown so an or condition instead of and.
          this.overlayElements?.classList.add('fadeOut', 'main-overlay-hidden');
          this.overlayElements?.classList.remove('fadeIn');
      }
    }, 2500);
  }

  playPauseVideo() {
    this.currentVideo = document.getElementById("video");
    if (!this.isPlaying) {
      this.loaderPanel.classList.remove("loaderHidden");
      setVideocurrentTime(this.data).then(() => {
        this.loaderPanel.classList.add("loaderHidden");
        this.isPlaying = true;
      })
    }

    if (this.currentVideo.paused) {
      this.currentVideo.play();
      this.icon_name = 'pause';
      this.rewindBtn.classList.remove("alwaysHide");
      this.forwardBtn.classList.remove("alwaysHide");
      this.progressMain.classList.remove("alwaysHide");
      // this.loaderPanel.classList.remove("loaderHidden");
    }

    else {
      this.currentVideo.pause(); 
      updateDb(this.data);
      this.icon_name = 'play';
      dismissInterval();
      this.toggleOverlayByUser();
    }
  }

  rewindVideo() {
    dismissInterval();
    this.toggleOverlayByUser();
    rewind();
  }

  forwardVideo() {
    dismissInterval();
    this.toggleOverlayByUser();
    forward();
  }

  videoEnded() {
    this.icon_name = 'play';
    clearInterval(this.interval);

    if (this.isNextVideo) {
      this.playNextVid();
    }
  }

  playNextVid() {
    this.loaderService.showLoader();
    this.btn.classList.remove('playNext');
    this.btn.classList.add('playNextHidden');
    videoEnded(this.data).then(() => {
      const no = this.data.number + this.i;
      var newVid = this.data.id.substr(0, this.data.id.lastIndexOf("-") + 1) + no;

      this.currentVideo = document.getElementById("video");
      this.currentVideo.pause();
      this.currentVideo.removeAttribute('src');

      this.localstorage.setItem('isFullscreen', 'true');

      const queryParams: any = {};

      queryParams.value = JSON.stringify(newVid);

      const navigationExtras: NavigationExtras = {queryParams}

      this.router.navigate(['player'], navigationExtras).then(() => {
        this.loaderService.hideLoader();
        window.location.reload(); 
      });

    })
  }

  nextVideo() {
    this.i += 1;
    const no = this.data.number + this.i;
    var newVid = this.data.id.substr(0, this.data.id.lastIndexOf("-") + 1) + no;

    return this.playVideo(newVid).then(() => {
      this.isNextVideo = true;
    })
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.isFullscreen = false;
    }

    else {
      this.isFullscreen = true;
    }

    this.fullscreenEvent();
  }

  fullscreenEvent() {
    const vid: any = document.getElementById("videoContainer");

    if (this.isFullscreen) {
      if (vid.requestFullscreen)
      {
        vid.requestFullscreen();
      }

      else if (vid.msRequestFullscreen)
      {
        vid.msRequestFullscreen();
      }
      else if (vid.mozRequestFullScreen) {
        vid.mozRequestFullScreen();
      }
      else if (vid.webkitRequestFullScreen) {
        vid.webkitRequestFullScreen();
      }

      this.fsIcon = 'contract';
    }
      else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          this.fsIcon = 'expand';
        }
    }
  }



  goBack() {
    updateDb(this.data);
    this.localstorage.setItem('isFullscreen', 'false');
    this.currentVideo = document.getElementById("video");
    this.currentVideo.pause();
    this.currentVideo.removeAttribute('src');
    clearInterval(this.interval);
    dismissInterval();
    ScreenOrientation.lock({ orientation: "portrait-primary" });
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.show();
    
    const vid: any = document.getElementById("videoContainer");
    if (vid.exitFullscreen) {
      vid.exitFullscreen();
    }

    else if (vid.webkitExitFullscreen) { /* Safari */
    vid.webkitExitFullscreen();
  } 

  else if (vid.msRExitFullscreen) { /* IE11 */
  vid.msRExitFullscreen();
  }

    if (this.localstorage.getItem('isFrom') == 'home') {
      this.router.navigate(['tabs']);
    }

    else if (this.localstorage.getItem('isFrom')== 'search') {
      this.router.navigate(['tabs/search']);
    }

    else if (this.localstorage.getItem('isFrom') == 'watchList') {
      this.router.navigate(['watch-list']);
    }
  }
  
  playVideo(value: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimePlayVideo(value).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  animeGetVideoServer(id: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getAnimeVideoServer(id).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  gogoAnimeGetDetails(query: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimeGetDetails(query).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }


  hideQualityContainer() {
    this.qualityContainer.classList.add('qualityContainerHidden');
    this.resetIdleTimer();
  }

  showQualityContainer() {
    this.qualityContainer.classList.remove('qualityContainerHidden');
    dismissInterval();
    this.toggleOverlayByUser();
  }

  onItemChange(value: any) {
    dismissInterval();
    if (this.quality != value) {
      let playing = false;
      let newQuality = '';
      if (value == 'Auto') {
        newQuality = 'default';
      }

      else {
        newQuality = value
      }

      if (!this.currentVideo.paused) {
        playing = true;
      }

      this.isPlaying = false;
      this.currentVideo.pause();
      this.playVideo(this.data.id).then((result: any) => {
        this.lastTime = this.currentVideo.currentTime;
        result.sources.forEach((value: any) => {
            if (value.quality == newQuality) {
              this.videoURL = value.url;
              this.trustedVideoUrl = value.url;
              changeQuality(this.trustedVideoUrl, this.lastTime);
              this.quality = value;
            }
            this.loaderPanel.classList.add("loaderHidden");
          })
      })
      if (playing) {
        this.currentVideo.play().then(() => {
          this.rewindBtn.classList.remove("alwaysHide");
          this.forwardBtn.classList.remove("alwaysHide");
          this.progressMain.classList.remove("alwaysHide");
        })
      }
    }
  }

  showVolumeRange() {
    this.volumeBar.classList.remove('volumeControlHidden');
    this.volumeBar.classList.remove('fadeOut');
    this.volumeBar.classList.add('fadeIn');
  }

  hideVolumeRange() {
    this.volumeBar.classList.remove('fadeIn');
    this.volumeBar.classList.add('fadeOut');
    this.volumeBar.classList.add('volumeControlHidden');
  }

  adjustVolume(e: any) {
    this.currentVideo.volume = e.target.value;
    this.changeVolumeIcon(e.target.value)
    this.localstorage.setItem('volumeLevel', e.target.value);
  }

  changeVolumeIcon(value: number) {
    if (value >= 0.75) {
      this.volumeIcon = 'volume-high';
    }

    else if (value <= 0.74 && value >= 0.5) {
      this.volumeIcon = 'volume-medium';
    }

    else if (value <= 0.49 && value >= 0.25) {
      this.volumeIcon = 'volume-low';
    }

    else if (value <= 0.24 && value >= 0.01) {
      this.volumeIcon = 'volume-off';
    }

    else if (value == 0) {
      this.volumeIcon = 'volume-mute';
    }
  }

  muteUnmute() {
    dismissInterval();
    // this.toggleOverlayByUser();
    if (this.currentVideo.volume > 0) {
      this.tempVol = this.currentVideo.volume;
      this.currentVideo.volume = 0;
      this.volumeBar.value = 0;
    }

    else {
      this.currentVideo.volume = this.tempVol;
      this.volumeBar.value = this.currentVideo.volume;
    }
    this.localstorage.setItem('volumeLevel', this.currentVideo.volume);
    this.changeVolumeIcon(this.currentVideo.volume);
  }
}