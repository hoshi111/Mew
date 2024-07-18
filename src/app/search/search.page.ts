import { Component } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';
import { LoaderService } from '../api/loader.service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'src/environments/environment';
import { GlobalVariable } from '../api/global';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss']
})
export class SearchPage {
  public subscription: any = Subscription;
  data: any = [];
  public results = [...this.data];
  query: any;
  movieDetails: any = [];
  i = 1;
  uid: any;
  localstorage = localStorage;
  listForEp: any = [];
  colSize: any;
  tempList: any = [];
  list: any = [];
  isKdrama: boolean = false;
  isManga: boolean = false;
  
  constructor(private apiService: ApiService,
              private router: Router,
              private modalCtrl: ModalController,
              private loaderService: LoaderService,
              public global: GlobalVariable
  ) {}

  async ngOnInit() {
    if (window.innerWidth <= 480) {
      this.colSize = 6;
    }

    else if (window.innerWidth > 480 && window.innerWidth <= 1024) {
      this.colSize = 3;
    }

    else if(window.innerWidth > 1024) {
      this.colSize = 2;
    }

    this.uid = this.localstorage.getItem('uid');
    await this.fetchData().then(() => {
      this.loaderService.hideLoader();
    });
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

  handleInput(e: any) {
    this.movieDetails = [];
    this.i = 1;
    this.query = e.target.value.toLowerCase();
    if(this.query) {
      this.findItems();
    }
  }

  findItems() {
    if (this.isKdrama) {
      this.kdramaSearch(this.query).then((result: any) => {
        result.results.forEach((item: any) => {
          this.movieDetails.push(item);
        })
      })
    }

    else if (this.isManga) {
      this.mangaSearch(this.query).then((result: any) => {
        console.log(result)
        result.results.forEach((item: any) => {
          this.movieDetails.push(item);
        })
      })
    }

    else {
      this.searchKeyword(this.query, this.i).then((result: any) => {
        result.results.forEach((item: any) => {
          this.movieDetails.push(item);
        })
      })
    }
  }

  onIonInfinite(ev: Event) {
    this.i += 1;
    this.findItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  async fetchData() {
    let flag = false;
    const querySnapshot = await getDocs(collection(db, this.uid));
     querySnapshot.forEach((doc: any) => {
      this.listForEp.push(doc.data().details);
      this.tempList.forEach((t: any | undefined) => {
        if (!this.isManga) {
          if (t.title == doc.data().details.title) {
            flag = true;
          }
        }

        else {
          if (t.mangaId == doc.data().details.mangaId) {
            flag = true;
          }
        }
      })
      
      if(!flag) {
        this.tempList.push(doc.data().details);
        
      }

      else {
        flag = false;
      }
    })

    if (!this.isManga) { 
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

    else {
      this.tempList.forEach(async (data: any) => {
        if (data.id.includes('0_manga-')) {
          console.log(data)
            await this.mangaInfo(data.mangaId).then((data2: any) => {
              this.list.push(data2);
            })
        }
      })
    }

  }

  async openDetailsModal(value: any) {
    this.loaderService.showLoader();

    if (this.isKdrama) {
      this.kdramaInfo(value.id).then(async(result: any) => {
        console.log(result)
        this.localstorage.setItem('kdramaId', value.id);
        result['listForEp'] = this.listForEp;
        result['isKdrama'] = true;
        result['isManga'] = false;
        this.localstorage.setItem('isFrom', 'search');
        this.global.data = result;
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

    else if (this.isManga) {

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

    else {
      this.gogoAnimeGetDetails(value.id).then(async(result: any) => {
        result['listForEp'] = this.listForEp;
        result['isKdrama'] = false;
        result['isManga'] = false;
        this.localstorage.setItem('isFrom', 'search');
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

  checkboxChecked(event: any) {
    if (event.target.value == 'kdrama') {
      this.isKdrama = true;
      this.isManga = false;
    }

    else if(event.target.value == 'manga') {
      this.isKdrama = false;
      this.isManga = true;
    }

    else {
      this.isKdrama = false;
      this.isManga = false;
    }

    this.movieDetails = [];
    this.i = 1;
    this.findItems();
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

  kdramaSearch(query: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.kdramaSearch(query).subscribe(
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

  getVideo(id: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getSpecificMovie(id).subscribe(
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
