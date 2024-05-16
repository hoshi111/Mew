import { ApplicationRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VgApiService, VgMediaDirective } from '@videogular/ngx-videogular/core';



@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  @ViewChild(VgMediaDirective, { static: true })
  media: VgMediaDirective | undefined;
  public subscription: any = Subscription;
  data: any = [];
  trustedVideoUrl: SafeResourceUrl | undefined;
  videoPlayer: any;
  abc: any;
  api: VgApiService = new VgApiService;
  urlVideo: any;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              public navCtrl: NavController,
              private domSanitizer: DomSanitizer,
              private loaderService: LoaderService,
              private apiService: ApiService,
              private http: HttpClient
  ) { }

  ngOnInit() {

    const value = this.activatedRoute.snapshot.queryParamMap.get('value');

    if (value != null) {
      this.data = JSON.parse(value);
      console.log(this.data)
      // this.trustedVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.data.link);

      if (!this.data.isAnime) {
      this.trustedVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://vidsrc.to/embed/movie/' + this.data.id);


      }
      
      else {
      this.animeGetVideoServer(this.data.id).then((result: any) => {
        console.log(result)
        this.subscription = this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/watch/' + this.data.id + '-episode-6').subscribe((result1: any) => {
          console.log(result1)
          result1.sources.forEach((data: any) => {
            if (data.quality == 'default') {
              this.trustedVideoUrl = data.url;
            }
          })
        })
        // this.trustedVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(result1.referrer);
        })
      }
    }
    else {
      console.error('No data');
      this.goBack();
    }
  }

  playVideo(){
   
    // Play video
    this.api.play();
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
      this.playVideo.bind(this)
  );
}
  // onPlayerReady(api:VgApiService){
  //   this.api = api
  //   // this.urlVideo = this.items[0].url
  //  // this.api.fsAPI.toggleFullscreen()
  // }

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

  }
}
