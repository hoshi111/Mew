import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { LoaderService } from 'src/app/api/loader.service';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  public subscription: any = Subscription;
  list: any = [];
  movieDetails: any = [];
  // categories: any = [{name: 'Movies', pressed: true}, 
  //                    {name: 'TV Shows', pressed: false},
  //                    {name: 'Episodes', pressed: false},
  //                     {name: 'Anime', pressed: false}];

  categories: any = [{name: 'Anime Latest Episodes',code: 'anime-latest', pressed: true},
                      {name: 'Top-Airing Anime', code: 'anime-top', pressed: false},
                    ];
  
  isAnimeLatest:boolean = true;
  isAnimeTop: boolean = false;
  i = 1;
  isAnime: boolean = false;
  animeResults: any = [];

  constructor(private apiService: ApiService,
              private router: Router,
              private loaderService: LoaderService,
              private modalCtrl: ModalController


  ) {}

  handleRefresh(event: any) {
    setTimeout(() => {
      this.movieDetails = [];
      this.i = 1;
      this.ngOnInit();
      event.target.complete();
    }, 2000);
  }

  ngOnInit() {
    this.generateItems(this.categories[0].code);
    // this.animeRecentEpisodes();
  }

  test() {
    console.log('test')
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // generateItems(vid: any) {
  //   console.log(this.initial)
  //   this.getList(vid, 'new', this.i).then((result: any) => {
  //     this.list = result.result.items;
  //     console.log(this.list)

  //     if (this.initial === 'movie') {
  //       this.list.forEach((item: any) => {
  //         this.getDetail(item.imdb_id).then((result: any) => {
  //           // console.log(result)
  //           result.movie_results[0].displayTitle = item.title;
  //           result.movie_results[0].link = item.embed_url_imdb;
  //           result.movie_results[0].isAnime = false;
  //           this.movieDetails.push(result.movie_results[0])
  //         })
  //       })
  //     }

  //     else if (this.initial === 'tv') {
  //       this.list.forEach((item: any) => {
  //         this.getDetail(item.imdb_id).then((result: any) => {
  //           console.log('result: ', result)
  //           result.tv_results[0].displayTitle = item.title;
  //           result.tv_results[0].link = item.embed_url_imdb;
  //           result.movie_results[0].isAnime = false;
  //           this.movieDetails.push(result.tv_results[0])
  //         })
  //       })
  //     }

  //     else {
  //       this.list.forEach((item: any) => {
  //         this.getDetail(item.imdb_id).then((result: any) => {
  //           // console.log(result)
  //           result.episode_results[0].displayTitle = item.title;
  //           result.episode_results[0].link = item.embed_url_imdb;
  //           result.movie_results[0].isAnime = false;
  //           this.movieDetails.push(result.episode_results[0])
  //         })
  //       })
  //     }
      
  //     console.log(this.movieDetails)
  //   })
  // }

  generateItems(vid: any) {
    console.log(vid)
    if (vid == 'anime-latest') {
      this.animeRecentEpisodes();
    }

    else if (vid == 'anime-top') {
      this.animeTopAiring();
    }
  }

  onIonInfinite(ev: Event) {
    this.categories.forEach((category: any) => {
      if(category.pressed) {
        this.i += 1;
        if (category.code == 'anime-latest') {
          this.animeRecentEpisodes();
        }
    
        else if (category.code == 'anime-top') {
          this.animeTopAiring();
        }
      }
    })
    // if (!this.isAnime) {
    //   this.generateItems(this.initial);
    // }

    // else {
    //   this.animeRecentEpisodes();
    // }
    
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  chooseCat(index:any) {

    this.categories.forEach((category: any) => {
      category.pressed = false;
    });
    index.pressed = !index.pressed;

    if (index.code == 'anime-latest') {
      this.isAnime = true;
      this.animeResults = [];
      this.movieDetails = [];
      this.i = 1;
      this.animeRecentEpisodes();
    }

    else if (index.code == 'anime-top') {
      this.isAnime = true;
      this.animeResults = [];
      this.movieDetails = [];
      this.i = 1;
      this.animeTopAiring();
    }

    // else if (index.name == 'Anime') {
    //   this.isAnime = true;
    //   this.animeResults = [];
    //   this.movieDetails = [];
    //   this.i = 1;
    //   this.animeRecentEpisodes();
      
    // }

    // if (index.name == 'Movies') {
    //   this.isAnime = false;
    //   this.movieDetails = [];
    //   this.i = 1;
    // }

    // else if (index.name == 'TV Shows') {
    //   this.isAnime = false;
    //   this.movieDetails = [];
    //   this.i = 1;
    // }

    // else if (index.name == 'Episodes') {
    //   this.isAnime = false;
    //   this.movieDetails = [];
    //   this.i = 1;
    // }

    // else if (index.name == 'Anime') {
    //   this.isAnime = true;
    //   this.animeResults = [];
    //   this.movieDetails = [];
    //   this.i = 1;
    //   this.animeRecentEpisodes();
      
    // }
  }

  animeRecentEpisodes() {
    this.isAnimeLatest = true;
    this.isAnimeTop = false;
    console.log(this.isAnimeLatest, this.isAnimeTop)
    this.animeGetRecent(this.i).then((result: any) => {
      console.log(result)
      result.results.forEach((item: any) => {
        this.animeResults = {
          id: item.id,
          displayTitle: item.title,
          image: item.image,
          link: item.url,
        }

        this.movieDetails.push(this.animeResults)
      })

      console.log(this.movieDetails)
    })
  }

  animeTopAiring() {
    this.isAnimeLatest = false;
    this.isAnimeTop = true;
    console.log(this.isAnimeLatest, this.isAnimeTop)
    this.animeGetTopAiring(this.i).then((result: any) => {
      console.log(result)
      result.results.forEach((item: any) => {
        this.animeResults = {
          id: item.id,
          displayTitle: item.title,
          image: item.image,
          link: item.url,
        }

        this.movieDetails.push(this.animeResults)
      })

      console.log(this.movieDetails)
    })
  }

  getList(vid: string, type: string, page: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getLatestMovies(vid, type, page).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  getDetail(id: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getDetail(id).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  animeGetRecent(page: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimeRecentEp(page).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  animeGetTopAiring(page: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimeTopAiring(page).subscribe(
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

  showDetailsPage(movieDetail: any) {
    console.log(movieDetail)
    this.loaderService.showLoader();
    if (this.isAnimeLatest) {
      this.gogoAnimeGetDetails(movieDetail.id).then((result: any) => {
        console.log(result);
        const ep = result.episodes[(result.episodes.length) - 1];
        ep['title'] = result.title;
        ep['image'] = result.image;
        console.log(ep)
  
        const queryParams: any = {};
  
      queryParams.value = JSON.stringify(ep);
  
      const navigationExtras: NavigationExtras = {queryParams}
      
      this.router.navigate(['player'], navigationExtras).then(() => {
        this.loaderService.hideLoader();
      });
      })
    }

    else {
      this.gogoAnimeGetDetails(movieDetail.id).then(async(result: any) => {
        const modal = await this.modalCtrl.create({
          component: DetailsModalComponent,
          componentProps: {state: result},
          breakpoints: [0, 0.6, 1],
          initialBreakpoint: 0.6,
          backdropDismiss: true,
          backdropBreakpoint: 0,
        });
        await modal.present().then(() => {
          this.loaderService.hideLoader();
        });
      })
    }
  }
}
