import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { LoaderService } from 'src/app/api/loader.service';
import { InfiniteScrollCustomEvent, ModalController, NavController, Platform } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'src/environments/environment';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { App } from '@capacitor/app';
import { GlobalVariable } from '../api/global';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit{
  public subscription: any = Subscription;
  localstorage = localStorage;
  list: any = [];
  movieDetails: any = [];
  colSize: any;
  // categories: any = [{name: 'Movies', pressed: true}, 
  //                    {name: 'TV Shows', pressed: false},
  //                    {name: 'Episodes', pressed: false},
  //                     {name: 'Anime', pressed: false}];

  categories: any = [{name: 'Anime Latest Episodes',code: 'anime-latest', pressed: true},
                      {name: 'Top-Airing Anime', code: 'anime-top', pressed: false},
                    ];
  
  isAnimeLatest:boolean = true;
  isAnimeTop: boolean = false;
  i = 4;
  isAnime: boolean = false;
  animeResults: any = [];
  uid: any;
  listForEp: any = [];
  tempList: any = [];
  selectedCat: string = 'anime';

  constructor(private apiService: ApiService,
              private router: Router,
              private loaderService: LoaderService,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private platform: Platform,
              public global: GlobalVariable
  ) { }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.movieDetails = [];
      this.i = 4;
      this.ngOnInit();
      event.target.complete();
    }, 2000);
  }

  ngOnInit() {
    ScreenOrientation.lock({ orientation: "portrait-primary" });
    this.localstorage.setItem('isFullscreen', 'false');
    this.uid = this.localstorage.getItem('uid');
    this.fetchData();
    this.localstorage.setItem('isKdrama', 'false');
    
    if (window.innerWidth <= 480) {
      this.colSize = 6;
    }

    else if (window.innerWidth > 480 && window.innerWidth <= 1024) {
      this.colSize = 3;
    }

    else if(window.innerWidth > 1024) {
      this.colSize = 2;
    }

    this.animeTopAiring();
  }

  onResize(e: any) {
    if (e.target.innerWidth <= 480) {
      this.colSize = 6;
    }

    else if (e.target.innerWidth > 480 && e.target.innerWidth <= 1024) {
      this.colSize = 3;
    }

    else if(e.target.innerWidth > 1024) {
      this.colSize = 2;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  generateItems(vid: any) {
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
        this.i += 4;
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

  chooseCat(event:any) {
    this.selectedCat = event.detail.value;
    console.log(event.detail.value)

    if (event.detail.value == 'anime') {
      this.animeResults = [];
      this.movieDetails = [];
      this.i = 4;
      this.animeTopAiring();
    }

    else if (event.detail.value == 'manga') {
      this.animeResults = [];
      this.movieDetails = [];
    }

    // this.categories.forEach((category: any) => {
    //   category.pressed = false;
    // });
    // index.pressed = !index.pressed;

    // if (index.code == 'anime-latest') {
    //   this.isAnime = true;
    //   this.animeResults = [];
    //   this.movieDetails = [];
    //   this.i = 4;
    //   this.animeRecentEpisodes();
    // }

    // else if (index.code == 'anime-top') {
    //   this.isAnime = true;
    //   this.animeResults = [];
    //   this.movieDetails = [];
    //   this.i = 4;
    //   this.animeTopAiring();
    // }

  }

  query: any;

  handleInput(e: any) {
    this.movieDetails = [];
    this.i = 1;
    this.query = e.target.value.toLowerCase();
    if(this.query) {
      this.findItems();
    }
  }

  findItems() {
    this.mangaSearch(this.query).then((result: any) => {
      result.results.forEach((item: any) => {
        this.movieDetails.push(item);
      })
      console.log(this.movieDetails)
    })
  }

  async openDetailsModal(value: any) {
    this.loaderService.showLoader();
    this.mangaInfo(value.id).then(async(result: any) => {
      console.log(result)
      this.localstorage.setItem('mangaId', value.id);
      result['listForEp'] = this.listForEp;
      result['isKdrama'] = false;
      result['isManga'] = true;
      this.localstorage.setItem('isFrom', 'search');
      this.global.data = result;
      this.global.mangaId = value.id;
      const modal = await this.modalCtrl.create({
        component: DetailsModalComponent,
        breakpoints: [0, 0.6, 1],
        initialBreakpoint: 1,
        backdropDismiss: true,
        backdropBreakpoint: 0,
      });
      await modal.present().then(() => {
        this.loaderService.hideLoader();
      })
    })
  }

  j = 0;

  onIonInfiniteManga(ev: Event) {
    this.i += 1;
    this.findItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  animeRecentEpisodes() {
    this.isAnimeLatest = true;
    this.isAnimeTop = false;

    for (let x = 0; x < this.i; x ++) {
      this.animeGetRecent(x + 1).then((result: any) => {
        result.results.forEach((item: any) => {
          this.animeResults = {
            id: item.id,
            displayTitle: item.title,
            image: item.image,
            link: item.url,
          }
  
          this.movieDetails.push(this.animeResults)
        })
      })
    }
  }

  animeTopAiring() {
    this.isAnimeLatest = false;
    this.isAnimeTop = true;

    for (let x = 0; x < this.i; x ++) {
      this.animeGetTopAiring(x + 1).then((result: any) => {
        result.results.forEach((item: any) => {
          this.animeResults = {
            id: item.id,
            displayTitle: item.title,
            image: item.image,
            link: item.url,
          }
  
          this.movieDetails.push(this.animeResults)
        })
      })
    }
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

  searchKeyword(query: string, page: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.searchAnime(query, page).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  mangaSearch(query: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.mangaSearch(query).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  mangaInfo(id: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.mangaInfo(id).subscribe(
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
    this.loaderService.showLoader();
    this.global.data = [];
    if (this.isAnimeLatest) {
      this.gogoAnimeGetDetails(movieDetail.id).then((result: any) => {
        
        const ep = result.episodes[(result.episodes.length) - 1];
        // console.log(ep.id.split("-"));
      //   ep['title'] = result.title;
      //   ep['image'] = result.image;
      //   ep['isFrom'] = 'home';
      //   console.log(ep)
  
        const queryParams: any = {};
  
        queryParams.value = JSON.stringify(ep.id);
    
        let navigationExtras: NavigationExtras = {};

        navigationExtras = {queryParams};

        this.localstorage.setItem('isFrom', 'home');
        
        this.router.navigate(['player'], navigationExtras).then(() => {
          this.loaderService.hideLoader();
        });
      })
    }

    else {
      this.gogoAnimeGetDetails(movieDetail.id).then(async(result: any) => {
        result['listForEp'] = this.listForEp;
        result['isKdrama'] = false;
        result['isManga'] = false;
        this.localstorage.setItem('isFrom', 'home');
        this.global.data = result;
        const modal = await this.modalCtrl.create({
          component: DetailsModalComponent,
          componentProps: {state: result},
          breakpoints: [0, 0.6, 1],
          initialBreakpoint: 1,
          backdropDismiss: true,
          backdropBreakpoint: 0,
        });
        await modal.present().then(() => {
          this.loaderService.hideLoader();
        })
      })
    }
  }

  async fetchData() {
    let flag = false;
    const querySnapshot = await getDocs(collection(db, this.uid));
     querySnapshot.forEach((doc: any) => {
      this.listForEp.push(doc.data().details);
      this.tempList.forEach((t: any | undefined) => {
        if (t.title == doc.data().details.title) {
          flag = true;
        }
      })
      
      if(!flag) {
        this.tempList.push(doc.data().details);
        
      }

      else {
        flag = false;
      }
    })

    this.tempList.forEach(async (data: any) => {
      console.log(data.id.includes('0_manga-'))
      if (!data.id.includes('0_manga-')) {
        await this.searchKeyword(data.title, 1).then(async (data1: any) => {
          await this.gogoAnimeGetDetails(data1.results[0].id).then((data2: any) => {
            this.list.push(data2);
          })
        })
      }
    })
  }

  openProfile() {
    this.navCtrl.navigateForward('tabs/profile')
  }
}

// async fetchData() {
//   let flag = false;
//   const querySnapshot = await getDocs(collection(db, this.uid));
//    querySnapshot.forEach((doc: any) => {
//     this.listForEp.push(doc.data().details);
//     this.tempList.forEach((t: any | undefined) => {
//       if (!this.isManga) {
//         if (t.title == doc.data().details.title) {
//           flag = true;
//         }
//       }

//       else {
//         if (t.mangaId == doc.data().details.mangaId) {
//           flag = true;
//         }
//       }
//     })
    
//     if(!flag) {
//       this.tempList.push(doc.data().details);
      
//     }

//     else {
//       flag = false;
//     }
//   })

//   if (!this.isManga) { 
//     this.tempList.forEach(async (data: any) => {
//       console.log(data.id.includes('0_manga-'))
//       if (!data.id.includes('0_manga-')) {
//         await this.searchKeyword(data.title, 1).then(async (data1: any) => {
//           await this.gogoAnimeGetDetails(data1.results[0].id).then((data2: any) => {
//             this.list.push(data2);
//           })
//         })
//       }
//     })
//   }

//   else {
//     this.tempList.forEach(async (data: any) => {
//       if (data.id.includes('0_manga-')) {
//         console.log(data)
//           await this.mangaInfo(data.mangaId).then((data2: any) => {
//             this.list.push(data2);
//           })
//       }
//     })
//   }

// }
