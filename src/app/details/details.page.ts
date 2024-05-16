import { Component, OnInit, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { ApiService } from '../api/api.service';
import { Subscription, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {check} from 'src/assets/video-js' ;
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  private topOverlayElements: HTMLDivElement | undefined;
  private bottomOverlayElements: HTMLDivElement | undefined;
  private header: HTMLDivElement | undefined;
  private timeoutDelay: any;
  public subscription: any = Subscription;
  data: any = [];
  trustedVideoUrl: SafeResourceUrl | undefined;
  value: any;
  sub: any;
  info: any;
  interval: any;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              public navCtrl: NavController,
              private domSanitizer: DomSanitizer,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private http: HttpClient,
  ) { }

  ngOnInit() {
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

    if (value != null) {
      this.data = JSON.parse(value);
      console.log(this.data)
      // this.trustedVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.data.link);

      if (!this.data.isAnime) {
      this.trustedVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.data.link);
      // check(this.data.link);

      }
      
      else {
        this.animeGetVideoServer(this.data.id).then((result: any) => {
          console.log(result)
          this.subscription = this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/watch/' + this.data.id + '-episode-6').subscribe((result1: any) => {
            console.log(result1)
            result1.sources.forEach((data: any) => {
              if (data.quality == 'default') {
                console.log(data.url)
                this.trustedVideoUrl = data.url;
                this.header?.classList.add('headerHidden');
                check(this.trustedVideoUrl);
              }
            })
          })
        })
      }
    }
    else {
      console.error('No data');
      this.goBack();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public toggleOverlayByUser() {
    console.log("into toggle overlay");
    this.topOverlayElements?.classList.remove('fadeOut');
    this.bottomOverlayElements?.classList.remove('fadeOut');
    this.resetIdleTimer();
    if (this.topOverlayElements?.classList.contains('top-overlay-hidden') ||
      (this.bottomOverlayElements?.classList.contains('bottom-overlay-hidden'))) {
      this.topOverlayElements?.classList.remove('top-overlay-hidden');
      this.topOverlayElements?.classList.add('fadeIn');
      this.bottomOverlayElements?.classList.remove('bottom-overlay-hidden');
      this.bottomOverlayElements?.classList.add('fadeIn');
    }
    else {
      this.topOverlayElements?.classList.remove('fadeIn');
      this.topOverlayElements?.classList.add('top-overlay-hidden');
      this.bottomOverlayElements?.classList.remove('fadeIn');
      this.bottomOverlayElements?.classList.add('bottom-overlay-hidden');
    }
  }
  public ngAfterViewInit() {
    this.topOverlayElements = document.getElementById('topOverlay') as HTMLDivElement;
    this.bottomOverlayElements = document.getElementById('bottomOverlay') as HTMLDivElement;
    this.resetIdleTimer();
  }
  public resetIdleTimer()
  {
    clearTimeout(this.timeoutDelay);
    this.timeoutDelay = setTimeout(() => {
      if (!this.topOverlayElements?.classList.contains('top-overlay-hidden') ||
        (!this.bottomOverlayElements?.classList.contains('bottom-overlay-hidden'))) {
        // Ideally either both controls will be shown or not shown so an or condition instead of and.
        this.topOverlayElements?.classList.add('fadeOut', 'top-overlay-hidden');
        this.topOverlayElements?.classList.remove('fadeIn');
        this.bottomOverlayElements?.classList.add('fadeOut', 'bottom-overlay-hidden');
        this.bottomOverlayElements?.classList.remove('fadeIn');
      }
    }, 4000);
    console.log("reset Idle timer and do something");
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

  goBack() {
    clearInterval(this.interval)
    ScreenOrientation.lock({ orientation: "portrait-primary" });
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.show();
    this.router.navigate(['/tabs/tab1']);
  }
  
}
