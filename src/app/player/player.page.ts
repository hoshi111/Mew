import { Attribute, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild, } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { ApiService } from '../api/api.service';
import { Subscription, interval } from 'rxjs';
import { check, whilePlaying, nextAvailable, updateDb, dismissInterval, videoEnded, setVideocurrentTime, rewind, forward, changeQuality, levels, introTime } from 'src/assets/video-js' ;
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { Location } from "@angular/common";
import Hls from 'hls.js';
import { GlobalVariable } from '../api/global';

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
  newVid: any;
  animeId: any;
  videoId: string = '';
  arrayNumber = 0;
  ccLink: string = '';

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
  newData: any;
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
  skipBtn: any;
  fsUpdate: any;
  isLoaded: boolean = false;
  isNextVideo: boolean = false;
  isAndroid = false;
  fsIcon = 'expand';
  quality = 'Auto';
  lastTime: number = 0;
  volumeIcon = 'volume-high';
  tempVol: any = 0.5;
  kdramaId: any;
  kdramaEpId: any;
  initValue: any;
  subtitle: any;

  hls = new Hls();

  alertInputs: any = {values: []};

  constructor(private activatedRoute: ActivatedRoute,
              public navCtrl: NavController,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private router: Router,
              private platform: Platform,
              public global: GlobalVariable
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
    this.initSetup();
  }

  async initSetup() {
    this.btn = document.getElementById('playNext');
    this.skipBtn = document.getElementById('skipIntro');
    this.currentVideo = document.getElementById("video");
    // this.subtitle = document.getElementById("sub");
    this.currentVideo.removeAttribute('src');
    if (!this.newData) {
      this.initValue = this.activatedRoute.snapshot.queryParamMap.get('value');
    }

    else {
      this.initValue = '"' + this.newData + '"';
    }

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
      if (this.initValue) {
        if (this.localstorage.getItem('isKdrama') == 'true') {
          this.kdramaId = this.localstorage.getItem('kdramaId');
          if (this.kdramaId) {
            this.kdramaInfo(this.kdramaId).then((result: any) => {
              result.episodes.forEach((ep: any) => {
                if ('"' + ep.id + '"' == this.initValue) {
                  this.data = ep;
                  this.data['title'] = result.title;
                  this.data['image'] = result.image;
                  // this.displayTitle = result.title + ' | Episode ' + ep.episode;
                  this.kdramaEpId = ep.id;
                  
                  this.setLink();
                }
              })
            })
          }
        }

        else {
          let temp: any;
          
          temp = JSON.parse(this.initValue).split("+", 2);
          
          this.animeId = temp[1];
          this.videoId = temp[0];

          await this.gogoAnimeGetDetails(this.animeId).then((result: any) => {

            this.global.animeCurrentEpisodes = result.episodes;

            result.episodes.forEach((ep: any) => {
              if (this.videoId == ep.id) {
                this.arrayNumber = result.episodes.indexOf(ep);
                this.data = ep;
                this.data['title'] = result.title;
                this.data['image'] = result.image;
              }
            })
          })
          
          this.setLink();
        }
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

  setLink() {
    this.isLoaded = true;
    // this.alertInputs.values = {};
    if (this.localstorage.getItem('isKdrama') == 'true') {
      this.data['number'] = this.data.episode;
      this.displayTitle = this.data.title + ' | Episode ' + this.data.number;
      this.kdramaPlayVideo(this.data.id, this.kdramaId).then(async (value: any) => {
        this.videoURL = value.sources[0].url;
        // await check(this.videoURL);

        if (Hls.isSupported()) {
          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              // console.log('video and hls.js are now bound together !');
          });
  
          this.hls.on(Hls.Events.MANIFEST_PARSED,  (event, data) => {
              for (let i = 0; i < data.levels.length; i++) {
                this.alertInputs.values.push({'value': data.levels[i].height + 'p', 'id': i})
              }
              this.alertInputs.values.push({'value': 'Auto', 'id': -1});
              this.alertInputs.values = this.alertInputs.values.reverse();
          });

          this.hls.on(Hls.Events.LEVEL_SWITCHING, () => {
          })
          
          this.currentVideo.removeAttribute('src');
          this.hls.loadSource(this.videoURL);
          this.hls.attachMedia(this.currentVideo);

          if(this.newData) {
            this.loaderService.hideLoader();
            this.currentVideo.play();
            this.progressBar.value = 0;
            this.maxDuration.innerText = '00:00';
            this.rewindBtn.classList.remove("alwaysHide");
            this.forwardBtn.classList.remove("alwaysHide");
            this.progressMain.classList.remove("alwaysHide");
          }
      }
        whilePlaying();
      })
    }

    else {
      this.displayTitle = this.data.title + ' | Episode ' + this.data.number;

      this.playVideo(this.data.id).then((result: any) => {

        this.global.introTimeStart = result.intro.start;
        this.global.introTimeEnd = result.intro.end;
        introTime(this.global.introTimeStart, this.global.introTimeEnd);
        this.global.outtroTimeStart = result.outro.start;

        result.subtitles.forEach((sub: any) => {
          if (sub.lang == 'English') {
            this.ccLink = sub.url;
          }
        })
        
        result.sources.forEach(async (value: any) => {
          this.videoURL = value.url;

          if (Hls.isSupported()) {
            this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                // console.log('video and hls.js are now bound together !');
            });
    
            this.hls.on(Hls.Events.MANIFEST_PARSED,  (event, data) => {
                for (let i = 0; i < data.levels.length; i++) {
                  this.alertInputs.values.push({'value': data.levels[i].height + 'p', 'id': i})
                }
                this.alertInputs.values.push({'value': 'Auto', 'id': -1});
                this.alertInputs.values = this.alertInputs.values.reverse();
            });
  
            this.hls.on(Hls.Events.LEVEL_SWITCHING, () => {
            })
            
            this.currentVideo.removeAttribute('src');
            this.hls.loadSource(this.videoURL);
            this.hls.attachMedia(this.currentVideo);
            // this.hls.subtitleDisplay = true;
            // this.subtitle = this.ccLink;
            // this.currentVideo.removeAttribute('src');
            // this.subtitle.removeAttribute('src');
            var sub = document.createElement('track');
            sub.setAttribute('src', this.ccLink);
            sub.setAttribute('label', 'English');
            sub.setAttribute('kind', 'subtitles');
            sub.setAttribute('srclang', 'en');
            sub.setAttribute('default', '');
            this.currentVideo.appendChild(sub);
            // this.subtitle.src = this.ccLink;
            // this.subtitle
            // console.log(this.subtitle.src)


            if(this.newData) {
              this.loaderService.hideLoader();
              this.currentVideo.play();
              this.icon_name = 'pause';
              this.progressBar.value = 0;
              this.maxDuration.innerText = '00:00';
              this.rewindBtn.classList.remove("alwaysHide");
              this.forwardBtn.classList.remove("alwaysHide");
              this.progressMain.classList.remove("alwaysHide");
            }
          }


          // await this.nextVideo().then(() => {
          //   if (this.isNextVideo) {
          //     alert("TRUE")
              
          //   }
          // })
          this.nextVideo();
          whilePlaying();


          // if (value.quality == 'default') {
          //   this.videoURL = value.url;
          //   console.log(this.videoURL)

          //   if (Hls.isSupported()) {
          //     this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          //         // console.log('video and hls.js are now bound together !');
          //     });
      
          //     this.hls.on(Hls.Events.MANIFEST_PARSED,  (event, data) => {
          //         for (let i = 0; i < data.levels.length; i++) {
          //           this.alertInputs.values.push({'value': data.levels[i].height + 'p', 'id': i})
          //         }
          //         this.alertInputs.values.push({'value': 'Auto', 'id': -1});
          //         this.alertInputs.values = this.alertInputs.values.reverse();
          //     });
    
          //     this.hls.on(Hls.Events.LEVEL_SWITCHING, () => {
          //     })
              
          //     this.currentVideo.removeAttribute('src');
          //     this.hls.loadSource(this.videoURL);
          //     this.hls.attachMedia(this.currentVideo);

          //     if(this.newData) {
          //       this.loaderService.hideLoader();
          //       this.currentVideo.play();
          //       this.progressBar.value = 0;
          //       this.maxDuration.innerText = '00:00';
          //       this.rewindBtn.classList.remove("alwaysHide");
          //       this.forwardBtn.classList.remove("alwaysHide");
          //       this.progressMain.classList.remove("alwaysHide");
          //     }
          //   }
          //   whilePlaying();
          // }
        })
      }).then(() => {
        let created = false;
      })
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

  skipIntro() {
    // this.skipBtn.classList.remove('skipIntro');
    // this.skipBtn.classList.add('skipIntroHidden');
    // this.rewindBtn.classList.add("alwaysHide");
    // this.forwardBtn.classList.add("alwaysHide");
    // this.progressMain.classList.add("alwaysHide");

    this.currentVideo.currentTime = this.global.introTimeEnd;
  }

  playNextVid() {
    this.btn.classList.remove('playNext');
    this.btn.classList.add('playNextHidden');
    this.rewindBtn.classList.add("alwaysHide");
    this.forwardBtn.classList.add("alwaysHide");
    this.progressMain.classList.add("alwaysHide");
    this.loaderService.showLoader();
    this.ccLink = '';

    this.isLoaded = false;

    this.newData = this.newVid;

      this.currentVideo = document.getElementById("video");
      this.currentVideo.pause();
      this.currentVideo.removeAttribute('src');
      this.currentVideo.removeAttribute('track');

      // this.localstorage.setItem('isFullscreen', 'true');

      const queryParams: any = {};

      queryParams.value = JSON.stringify(this.newVid);

      const navigationExtras: NavigationExtras = {queryParams}

      this.router.navigate(['player'], navigationExtras);
      this.initSetup();

    // videoEnded(this.data).then(() => {
    //   this.newData = this.newVid;

    //   this.currentVideo = document.getElementById("video");
    //   this.currentVideo.pause();
    //   this.currentVideo.removeAttribute('src');

    //   // this.localstorage.setItem('isFullscreen', 'true');

    //   const queryParams: any = {};

    //   queryParams.value = JSON.stringify(this.newVid + '+' + this.animeId);

    //   const navigationExtras: NavigationExtras = {queryParams}

    //   this.router.navigate(['player'], navigationExtras);
    //   this.isLoaded = false;
    //   this.ionViewWillEnter();
    // })
  }

  nextVideo() {
    // const no = this.data.number + 1;
    // let idSplit = this.data.id.split("-");

    // if (idSplit[idSplit.length - 2] != 'episode') {
    //   this.newVid = this.data.id + '-episode-' + no;
    // }
    // else {
    //   this.newVid = this.data.id.substr(0, this.data.id.lastIndexOf("-") + 1) + no;
    // }

    this.newVid = this.global.animeCurrentEpisodes[this.arrayNumber + 1].id;

    if (this.arrayNumber < this.global.animeCurrentEpisodes.length) {
      this.newVid = this.global.animeCurrentEpisodes[this.arrayNumber + 1].id + '+' + this.animeId;
      nextAvailable(this.global.outtroTimeStart, this.global.outtroTimeEnd);
      this.isNextVideo = true;
    }

    // await this.playVideo(this.newVid);
    // this.isNextVideo = true;
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
    // updateDb(this.data);
    this.localstorage.setItem('isFullscreen', 'false');
    this.localstorage.setItem('isKdrama', 'false');
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

    this.global.fromPlayer = true;

    this.router.navigate(['tabs/home']);
    
    // if (this.localstorage.getItem('isFrom') == 'home') {
    //   this.router.navigate(['tabs']);
    // }

    // else if (this.localstorage.getItem('isFrom')== 'search') {
    //   this.router.navigate(['tabs/search']);
    // }

    // else if (this.localstorage.getItem('isFrom') == 'watchList') {
    //   this.router.navigate(['watch-list']);
    // }
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

  kdramaInfo(query: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.kdramaInfo(query).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  kdramaPlayVideo(episodeId: any, dramaId: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.kdramaPlayVideo(episodeId, dramaId).subscribe(
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

  onItemChange(event: any) {
    dismissInterval();
    
    this.hls.currentLevel = event.target.id;
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