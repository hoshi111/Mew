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
import Hls from 'hls.js';

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

  hls = new Hls();


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

  qualityArray: any;

  epData: any = [];
  streamData: any = [];

  alertInputs: any = {values: []};

  constructor(private activatedRoute: ActivatedRoute,
              public navCtrl: NavController,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private router: Router,
              private platform: Platform,
              private location: Location,
              private route: ActivatedRoute
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

  async ionViewWillEnter() {
    this.btn = document.getElementById('playNext');
    this.currentVideo = document.getElementById("video");
    this.currentVideo.removeAttribute('src');
    let value = this.activatedRoute.snapshot.queryParamMap.get('value');
    
    if (value) {
      if (!this.isLoaded) {
        const tempVal = value.split('"');
        value = tempVal[1];
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

        
        const idSplitted = value.split("$");

        await this.zoroGetInfo(idSplitted[0]).then((result: any) => {
          console.log(result)

          result.episodes.forEach((ep: any) => {
            if (ep.id.toString() == value) {
              this.displayTitle = result.title + ' | Episode ' + ep.number;
            }
          })
        })
        console.log(this.displayTitle)
        await this.getStreamingLink(value).then((data: any) => {
          this.streamData = data;
          console.log(this.streamData)
        })


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
        this.currentVideo = document.getElementById("video");

        this.volumeBar.value = this.localstorage.getItem('volumeLevel');
        this.changeVolumeIcon(this.volumeBar.value);
        this.resetIdleTimer();
        
        this.isLoaded = true;
        this.trustedVideoUrl = this.streamData.sources[0].url;
        this.hlsFetchData();
        check(this.streamData.sources[0].url);
        whilePlaying();
      }
    }
    // else {
      // console.error('No data');
      // this.goBack();
    // }
  }

  async hlsFetchData() {
    if (Hls.isSupported()) {
      this.hls.loadSource(this.streamData.sources[0].url);
      await this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log(data.levels);
        // this.qualityArray = data.levels[0].height;
        // console.log(this.qualityArray)
        for (let i = 0; i < data.levels.length; i++) {
          this.alertInputs.values.push({'value': data.levels[i].height, id: data.levels[i].id});
        }
        this.alertInputs.values = this.alertInputs.values.reverse();
    });
    }
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
            console.log(value.url);
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
    // this.displayTitle = this.data.title + ' | Episode ' + this.data.number;
    let i = 1;
    let tempInputs: any = {values: []}

    this.playVideo(this.data.id).then((result: any) => {
      result.sources.forEach((value: any) => {
        console.log(value.quality)

          // if (value.quality != 'backup') {
          //   let q = value.quality;
          //   if (q == 'default') {
          //     this.alertInputs.values.push({'value': 'Auto'})
          //   }
          //   // alert('true')
          //   else {
          //     this.alertInputs.values.push({'value': q})
          //   }
          // }

        if (value.quality == 'default') {
          this.alertInputs.values = this.alertInputs.values.reverse();
          console.log(this.alertInputs)

          this.alertInputs.values.forEach((value: any) => {
            if (value == 'Auto') {
              const quality = document.getElementById(value) as HTMLElement;
              quality?.setAttribute('checked','true')
            }
          })
          this.videoURL = this.streamData.sources.url;
          this.trustedVideoUrl = value.url;
          check(this.trustedVideoUrl);
          whilePlaying();
        }
      })
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

  //       this.animeGetDetails(videoId).then((result: any) => {
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
      // updateDb(this.data);
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

      const queryParams: any = {};

      queryParams.value = JSON.stringify(newVid);
      console.log(queryParams)

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
      if (vid.requestFullscreen) {
        vid.requestFullscreen();
        this.fsIcon = 'contract';
      } 
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

  getStreamingLink(value: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getStreamingLink(value).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
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

  animeGetDetails(query: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.animeGetDetails(query).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  zoroSearch(query: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.zoroSearch(query).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  zoroGetInfo(query: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.zoroGetInfo(query).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  public alertButtons = [{text: 'OK',
                          handler: (data: any) => {
                            console.log(data);

                            if (data == 'default') {
                              if (this.quality != 'default') {
                                this.quality = 'default';
                                this.changeQuality();
                              }
                            }

                            else if (data == '1080p') {
                              if (this.quality != '1080p') {
                                this.quality = '1080p';
                                this.changeQuality();
                              }
                            }

                            else if (data == '720p') {
                              if (this.quality != '720p') {
                                this.quality = '720p';
                                this.changeQuality();
                              }
                            }

                            else if (data == '480p') {
                              if (this.quality != '480p') {
                                this.quality = '480p';
                                this.changeQuality();
                              }
                            }

                            else if (data == '360p') {
                              if (this.quality != '360p') {
                                this.quality = '360p';
                                this.changeQuality();
                              }
                            }
                          }
  }, 'Cancel'];

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
    console.log(value)

    this.alertInputs.values.forEach((result: any) => {
      if (result.value == value + 'p') {
        this.hls.currentLevel = result.value.id;
      }
    })
    
      // let playing = false;
      // let newQuality = '';
      // if (value == 'Auto') {
      //   newQuality = 'default';
      // }

      // else {
      //   this.alertInputs.values.forEach((result: any) => {
      //     if (result.value == value + 'p') {
      //       this.hls.currentLevel = result.value.id;
      //     }
      //   })
      // }

      // if (!this.currentVideo.paused) {
      //   playing = true;
      // }

      // this.isPlaying = false;
      // this.currentVideo.pause();
      // this.playVideo(this.data.id).then((result: any) => {
      //   this.lastTime = this.currentVideo.currentTime;
      //   result.sources.forEach((value: any) => {
      //       if (value.quality == newQuality) {
      //         console.log(value.url);
      //         this.videoURL = value.url;
      //         this.trustedVideoUrl = value.url;
      //         changeQuality(this.trustedVideoUrl, this.lastTime);
      //         this.quality = value;
      //       }
      //       this.loaderPanel.classList.add("loaderHidden");
      //     })
      // })
      // if (playing) {
      //   this.currentVideo.play().then(() => {
      //     this.rewindBtn.classList.remove("alwaysHide");
      //     this.forwardBtn.classList.remove("alwaysHide");
      //     this.progressMain.classList.remove("alwaysHide");
      //   })
      // }

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
      console.log(this.volumeIcon)
    }

    else if (value <= 0.74 && value >= 0.5) {
      this.volumeIcon = 'volume-medium';
      console.log(this.volumeIcon)
    }

    else if (value <= 0.49 && value >= 0.25) {
      this.volumeIcon = 'volume-low';
      console.log(this.volumeIcon)
    }

    else if (value <= 0.24 && value >= 0.01) {
      this.volumeIcon = 'volume-off';
      console.log(this.volumeIcon)
    }

    else if (value == 0) {
      this.volumeIcon = 'volume-mute';
      console.log(this.volumeIcon)
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




// ,
//     {
//       label: '1080p',
//       type: 'radio',
//       value: '1080p',
//     },
//     {
//       label: '720p',
//       type: 'radio',
//       value: '720p',
//     },
//     {
//       label: '480p',
//       type: 'radio',
//       value: '480p',
//     },
//     {
//       label: '360p',
//       type: 'radio',
//       value: '360p',
//     }