import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild, } from '@angular/core';
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
  progressBar: any;


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
  quality = 'default';
  lastTime: number = 0;

  alertInputs: any = [];

  @ViewChild('mainContent') videoPlayer: ElementRef | undefined;
  constructor(private activatedRoute: ActivatedRoute,
              public navCtrl: NavController,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private router: Router,
              private platform: Platform,
              private location: Location
  ) { }

  ngOnInit() {
    if (this.platform.is('android')) {
      this.isAndroid = true;
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
    this.isLoaded = true;
    this.displayTitle = this.data.title + ' | Episode ' + this.data.number;
    let i = 1;
    let tempInputs: { label: any; type: string; value: any; checked: boolean; }[] = [];
    this.playVideo(this.data.id).then((result: any) => {
      result.sources.forEach((value: any) => {
        console.log(value.quality)

          if (value.quality != 'backup') {
            let q = value.quality;
            if (q == 'default') {
              tempInputs.push({
                label: 'Auto',
                type: 'radio',
                value: 'Auto',
                checked: true
              })
            }
            // alert('true')
            else {
              tempInputs.push({
                label: q,
                type: 'radio',
                value: q,
                checked: false
              })
            }
          }

        if (value.quality == 'default') {
          this.alertInputs = tempInputs.reverse();
          console.log(this.alertInputs)
          this.videoURL = value.url;
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

  public ngAfterViewInit() {
    
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
        console.log(idSplitted);

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

        console.log(videoId)

        this.gogoAnimeGetDetails(videoId).then((result: any) => {
          console.log(idSplitted[idSplitted.length-1])
          this.data = result.episodes[idSplitted[idSplitted.length-1] - 1];
          console.log(this.data)
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


    this.resetIdleTimer();
  }

  public resetIdleTimer()
  {
    clearTimeout(this.timeoutDelay);
    this.timeoutDelay = setTimeout(() => {
      if (!this.overlayElements?.classList.contains('main-overlay-hidden')) {
        // Ideally either both controls will be shown or not shown so an or condition instead of and.
          this.overlayElements?.classList.add('fadeOut', 'main-overlay-hidden');
          this.overlayElements?.classList.remove('fadeIn');
      }
    }, 300000000);
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
    rewind();
    this.toggleOverlayByUser();
  }

  forwardVideo() {
    dismissInterval();
    forward();
    this.toggleOverlayByUser();
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