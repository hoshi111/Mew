import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { ApiService } from '../api/api.service';
import { Subscription, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { check, whilePlaying, nextAvailable, updateDb, dismissInterval } from 'src/assets/video-js' ;
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  @Input() state: any;
  private topOverlayElements: HTMLDivElement | undefined;
  private bottomOverlayElements: HTMLDivElement | undefined;
  private buttonsVideoControl: HTMLDivElement | undefined;
  private buttonRewind: HTMLDivElement | undefined;
  private buttonForward: HTMLDivElement | undefined;
  private progressBarElements: HTMLDivElement | undefined;
  private header: HTMLDivElement | undefined;
  private timeoutDelay: any;
  public subscription: any = Subscription;
  data: any = [];
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

  @ViewChild('mainContent') videoPlayer: ElementRef | undefined;
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              public navCtrl: NavController,
              private domSanitizer: DomSanitizer,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private http: HttpClient,
  ) { }

  ngOnInit() {
    this.btn = document.getElementById('playNext');

    this.currentVideo = document.getElementById("video");
    this.currentVideo.removeAttribute('src');
    const value = this.activatedRoute.snapshot.queryParamMap.get('value');
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

    if (value) {
      this.data = JSON.parse(value);
      this.setLink();
    }
    else {
      console.error('No data');
      this.goBack();
    }

    this.nextVideo().then(() => {
      nextAvailable();
    })
  }

  setLink() {
    this.displayTitle = this.data.title + ' | Episode ' + this.data.number;
    this.playVideo(this.data.id).then((result: any) => {
      result.sources.forEach((value: any) => {
          if (value.quality == 'default') {
            this.trustedVideoUrl = value.url;
            this.header?.classList.add('headerHidden');
            check(this.trustedVideoUrl);
            updateDb(this.data);
            whilePlaying();
          }
        })
    })
  }

  public toggleOverlayByUser() {
    this.topOverlayElements?.classList.remove('fadeOut');
    this.bottomOverlayElements?.classList.remove('fadeOut');
    this.buttonsVideoControl?.classList.remove('fadeOut');
    
    if (this.isPlaying) {
      this.progressBarElements?.classList.remove('fadeOut');
      this.buttonRewind?.classList.remove('fadeOut');
      this.buttonForward?.classList.remove('fadeOut');
    }

    this.resetIdleTimer();
    
    if (this.topOverlayElements?.classList.contains('top-overlay-hidden') ||
      (this.bottomOverlayElements?.classList.contains('bottom-overlay-hidden') || 
      (this.buttonsVideoControl?.classList.contains('buttonsVideoControl-hidden')))) {
        this.topOverlayElements?.classList.remove('top-overlay-hidden');
        this.topOverlayElements?.classList.add('fadeIn');
        this.bottomOverlayElements?.classList.remove('bottom-overlay-hidden');
        this.bottomOverlayElements?.classList.add('fadeIn');
        this.buttonsVideoControl?.classList.remove('buttonsVideoControl-hidden');
        this.buttonsVideoControl?.classList.add('fadeIn');
        
        if (this.isPlaying) {
          this.progressBarElements?.classList.remove('progressHidden');
          this.progressBarElements?.classList.add('fadeIn');
          this.buttonRewind?.classList.remove('rewindHidden');
          this.buttonRewind?.classList.add('fadeIn');
          this.buttonForward?.classList.remove('forwardHidden');
          this.buttonForward?.classList.add('fadeIn');
        }
    }
    else {
      this.topOverlayElements?.classList.remove('fadeIn');
      this.topOverlayElements?.classList.add('top-overlay-hidden');
      this.bottomOverlayElements?.classList.remove('fadeIn');
      this.bottomOverlayElements?.classList.add('bottom-overlay-hidden');
      this.buttonsVideoControl?.classList.remove('fadeIn');
      this.buttonsVideoControl?.classList.add('buttonsVideoControl-hidden');
      
      if (this.isPlaying) {
        this.progressBarElements?.classList.remove('fadeIn');
        this.progressBarElements?.classList.add('progressHidden');
        this.buttonRewind?.classList.remove('fadeIn');
        this.buttonRewind?.classList.add('rewindHidden');
        this.buttonForward?.classList.remove('fadeIn');
        this.buttonForward?.classList.add('forwardHidden');
      }
    }
  }
  public ngAfterViewInit() {
    this.topOverlayElements = document.getElementById('topOverlay') as HTMLDivElement;
    this.bottomOverlayElements = document.getElementById('bottomOverlay') as HTMLDivElement;
    this.buttonsVideoControl = document.getElementById('btnID') as HTMLDivElement;
    this.buttonRewind = document.getElementById('rewindBtn') as HTMLDivElement;
    this.buttonForward = document.getElementById('forwardBtn') as HTMLDivElement;
    this.progressBarElements = document.getElementById('progressComponents') as HTMLDivElement;
    this.resetIdleTimer();
  }
  public resetIdleTimer()
  {
    clearTimeout(this.timeoutDelay);
    this.timeoutDelay = setTimeout(() => {
      if (!this.topOverlayElements?.classList.contains('top-overlay-hidden') ||
        (!this.bottomOverlayElements?.classList.contains('bottom-overlay-hidden') ||
        (!this.buttonsVideoControl?.classList.contains('buttonsVideoControl-hidden')))) {
        // Ideally either both controls will be shown or not shown so an or condition instead of and.
          this.topOverlayElements?.classList.add('fadeOut', 'top-overlay-hidden');
          this.topOverlayElements?.classList.remove('fadeIn');
          this.bottomOverlayElements?.classList.add('fadeOut', 'bottom-overlay-hidden');
          this.bottomOverlayElements?.classList.remove('fadeIn');
          this.buttonsVideoControl?.classList.add('fadeOut', 'buttonsVideoControl-hidden');
          this.buttonsVideoControl?.classList.remove('fadeIn');
          
          if (this.isPlaying) {
            this.progressBarElements?.classList.add('fadeOut', 'progressBarHidden');
            this.progressBarElements?.classList.remove('fadeIn');
            this.buttonRewind?.classList.add('fadeOut', 'rewindHidden');
            this.buttonRewind?.classList.remove('fadeIn');
            this.buttonForward?.classList.add('fadeOut', 'forwardHidden');
            this.buttonForward?.classList.remove('fadeIn');
          }
      }
    }, 1000);
  }

  playPauseVideo() {
    this.currentVideo = document.getElementById("video");
    if (this.currentVideo.paused) {
      this.currentVideo.play();
      this.icon_name = 'pause';
      if (!this.isPlaying) {
        this.progressBarElements?.classList.remove('progressHidden');
        this.progressBarElements?.classList.add('progress');
        this.buttonRewind?.classList.remove('rewindHidden');
        this.buttonRewind?.classList.add('rewindProperty');
        this.buttonForward?.classList.remove('forwardHidden');
        this.buttonForward?.classList.add('forwardProperty');
        this.isPlaying = true;
      }
    }

    else {
      this.currentVideo.pause();
      this.icon_name = 'play';
      const c = document.getElementById('current-time');
      dismissInterval();
      this.toggleOverlayByUser();
    }
  }

  updateFS() {
    console.log(this.currentVideo)
  }

  rewindVideo() {

  }

  forwardVideo() {

  }

  videoEnded() {
    this.icon_name = 'play';
    
    this.topOverlayElements?.classList.remove('top-overlay-hidden');
    this.topOverlayElements?.classList.add('fadeIn');
    this.bottomOverlayElements?.classList.remove('bottom-overlay-hidden');
    this.bottomOverlayElements?.classList.add('fadeIn');
    this.buttonsVideoControl?.classList.remove('buttonsVideoControl-hidden');
    this.buttonsVideoControl?.classList.add('fadeIn');
    this.progressBarElements?.classList.remove('progressHidden');
    this.progressBarElements?.classList.add('fadeIn');
    this.buttonRewind?.classList.remove('rewindHidden');
    this.buttonRewind?.classList.add('fadeIn');
    this.buttonForward?.classList.remove('forwardHidden');
    this.buttonForward?.classList.add('fadeIn');
    clearInterval(this.interval);
  }

  playNext() {
    this.loaderService.showLoader();
    this.i += 1;
    this.btn?.classList.remove('playNext');
    this.btn?.classList.add('playNextHidden');
    const no = this.data.number + this.i;
    var newVid = this.data.id.substr(0, this.data.id.lastIndexOf("-") + 1) + no;
    this.playVideo(newVid).then((result: any) => {
      if (result) {
        result.sources.forEach((data: any) => {
          if (data.quality == 'default') {
            this.trustedVideoUrl = data.url;
            this.header?.classList.add('headerHidden');
            check(this.trustedVideoUrl);
            whilePlaying();
            this.displayTitle = this.data.title + ' | Episode ' + no;
            this.loaderService.hideLoader();
            this.currentVideo.play();
          }
        })
      }
    })
  }

  nextVideo() {
    this.i += 1;
    const no = this.data.number + this.i;
    var newVid = this.data.id.substr(0, this.data.id.lastIndexOf("-") + 1) + no;

    return this.playVideo(newVid).then(() => {
      console.log('Next Episode Available!')
    })
  }

  goBack() {
    this.currentVideo = document.getElementById("video");
    this.currentVideo.pause();
    this.currentVideo.removeAttribute('src');
    clearInterval(this.interval);
    dismissInterval();
    ScreenOrientation.lock({ orientation: "portrait-primary" });
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.show();
    this.navCtrl.back();
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
}
