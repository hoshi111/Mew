import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { ApiService } from '../api/api.service';
import { Subscription, interval } from 'rxjs';
import { check, whilePlaying, nextAvailable, updateDb, dismissInterval, videoEnded, setVideocurrentTime } from 'src/assets/video-js' ;
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile, toBlobURL } from '@ffmpeg/util';

const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  @Input() state: any;
  public subscription: any = Subscription;

  
  ffmpeg = new FFmpeg();
  videoURL: any;

  overlayElements!: HTMLElement;
  rewindBtn!: HTMLElement;
  forwardBtn!: HTMLElement;
  progressMain!: HTMLElement;
  loaderPanel!: HTMLElement;

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

  @ViewChild('mainContent') videoPlayer: ElementRef | undefined;
  constructor(private activatedRoute: ActivatedRoute,
              public navCtrl: NavController,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private router: Router
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

    if (!this.isLoaded) {
      if (value) {
        this.data = JSON.parse(value);
        console.log(this.data)
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
  }

  setLink() {
    this.isLoaded = true;
    this.displayTitle = this.data.title + ' | Episode ' + this.data.number;
    this.playVideo(this.data.id).then((result: any) => {
      console.log(result)
      result.sources.forEach((value: any) => {
          if (value.quality == 'default') {
            this.videoURL = value.url;
            this.load();
            this.trustedVideoUrl = value.url;
            check(this.trustedVideoUrl);
            whilePlaying();
          }
        })
    })
  }

  async load() {
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    })
    this.transcode();
  };

  async transcode() {
    await this.ffmpeg.writeFile("input.m3u8", await fetchFile(this.videoURL));
    await this.ffmpeg.exec(["-i", "input.m3u8", "output.mp4"]);
    const fileData = await this.ffmpeg.readFile('output.mp4');
    const data = new Uint8Array(fileData as ArrayBuffer);
    this.videoURL = URL.createObjectURL(
      new Blob([data.buffer], { type: 'video/mp4' })
    );
    console.log(this.videoURL)
  };

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

    this.overlayElements = document.getElementById('overlay') as HTMLDivElement;
    this.rewindBtn = document.getElementById('rewindBtn') as HTMLDivElement;
    this.forwardBtn = document.getElementById('forwardBtn') as HTMLDivElement;
    this.progressMain = document.getElementById('progressMain') as HTMLDivElement;
    this.loaderPanel  = document.getElementById("loaderContainer") as HTMLDivElement;

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
    }, 3000);
  }

  async playPauseVideo() {
    console.log(this.data)
    this.currentVideo = document.getElementById("video");
    if (!this.isPlaying) {
      await setVideocurrentTime(this.data);
      this.loaderPanel.classList.add("loaderHidden");
      this.isPlaying = true;
    }

    if (this.currentVideo.paused) {
      this.currentVideo.play();
      this.icon_name = 'pause';
      this.rewindBtn.classList.remove("alwaysHide");
      this.forwardBtn.classList.remove("alwaysHide");
      this.progressMain.classList.remove("alwaysHide");
      this.loaderPanel.classList.remove("loaderHidden");
    }

    else {
      this.currentVideo.pause(); 
      updateDb(this.data);
      this.icon_name = 'play';
      dismissInterval();
      this.toggleOverlayByUser();
    }
  }

  updateFS() {
    console.log(this.currentVideo)
  }

  rewindVideo() {
    dismissInterval();
    this.toggleOverlayByUser();
  }

  forwardVideo() {
    dismissInterval();
    this.toggleOverlayByUser();
  }

  videoEnded() {
    this.icon_name = 'play';
    
    // this.topOverlayElements?.classList.remove('top-overlay-hidden');
    // this.topOverlayElements?.classList.add('fadeIn');
    // this.bottomOverlayElements?.classList.remove('bottom-overlay-hidden');
    // this.bottomOverlayElements?.classList.add('fadeIn');
    // this.buttonsVideoControl?.classList.remove('buttonsVideoControl-hidden');
    // this.buttonsVideoControl?.classList.add('fadeIn');
    // this.progressBarElements?.classList.remove('progressHidden');
    // this.progressBarElements?.classList.add('fadeIn');
    // this.buttonRewind?.classList.remove('rewindHidden');
    // this.buttonRewind?.classList.add('fadeIn');
    // this.buttonForward?.classList.remove('forwardHidden');
    // this.buttonForward?.classList.add('fadeIn');
    clearInterval(this.interval);
  }

  playNextVid() {
    this.loaderService.showLoader();
    videoEnded(this.data).then(() => {
      this.btn?.classList.remove('playNext');
      this.btn?.classList.add('playNextHidden');
      const no = this.data.number + this.i;
      var newVid = this.data.id.substr(0, this.data.id.lastIndexOf("-") + 1) + no;
      this.newData = {
        title: this.data.title,
        id: newVid,
        number: no,
        image: this.data.image,
        url: this.data.url.substr(0, this.data.url.lastIndexOf("-") + 1) + no
      }

      this.currentVideo = document.getElementById("video");
      this.currentVideo.pause();
      this.currentVideo.removeAttribute('src');

      const queryParams: any = {};

      queryParams.value = JSON.stringify(this.newData);
      console.log(queryParams)

      const navigationExtras: NavigationExtras = {queryParams}

      console.log(navigationExtras)
      this.loaderService.hideLoader();
      this.router.navigateByUrl('/player?value=' + JSON.stringify(this.newData)).then(() => {
        window.location.reload();
      })
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
    updateDb(this.data);
    this.currentVideo = document.getElementById("video");
    this.currentVideo.pause();
    this.currentVideo.removeAttribute('src');
    clearInterval(this.interval);
    dismissInterval();
    ScreenOrientation.lock({ orientation: "portrait-primary" });
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.show();
    if (this.data.isFrom == 'home') {
      this.router.navigate(['tabs']);
    }

    else if (this.data.isFrom == 'search') {
      this.router.navigate(['tabs/tab2']);
    }

    else {
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
}
