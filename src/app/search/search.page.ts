import { Component } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';
import { LoaderService } from '../api/loader.service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'src/environments/environment';

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
  
  constructor(private apiService: ApiService,
              private router: Router,
              private modalCtrl: ModalController,
              private loaderService: LoaderService
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
    this.searchKeyword(this.query, this.i).then((result: any) => {
      if(!result) {
        console.log('true')
      }

      else {
        console.log(result.results)
      }
      result.results.forEach((item: any) => {
        this.movieDetails.push(item);
      })
      // console.log(result.results)
      // this.movieDetails = result.results
      // result.results.forEach((item: any) => {
      //   console.log(item)
      // })
    })
    console.log(this.movieDetails)
  }

  onIonInfinite(ev: Event) {
    this.i += 1;
    console.log(this.i, this.query)
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
    console.log(this.tempList)

    this.tempList.forEach(async (data: any) => {
      await this.searchKeyword(data.title, 1).then(async (data1: any) => {
        await this.gogoAnimeGetDetails(data1.results[0].id).then((data2: any) => {
          this.list.push(data2);
        })
      })
    });
  }

  async openDetailsModal(value: any) {
    this.loaderService.showLoader();

     console.log(value)
    this.gogoAnimeGetDetails(value.id).then(async(result: any) => {
      result['listForEp'] = this.listForEp;
      this.localstorage.setItem('isFrom', 'search');
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
      })
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
