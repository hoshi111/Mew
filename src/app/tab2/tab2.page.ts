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
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
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

  constructor(private apiService: ApiService,
              private router: Router,
              private modalCtrl: ModalController,
              private loaderService: LoaderService
  ) {}

  ngOnInit() {
    if (window.innerWidth <= 480) {
      this.colSize = 6;
    }

    else if (window.innerWidth > 480 && window.innerWidth <= 1024) {
      this.colSize = 3;
    }

    else if(window.innerWidth > 1024) {
      this.colSize = 2;
    }
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

  async openDetailsModal(value: any) {
    this.loaderService.showLoader();

    this.uid = this.localstorage.getItem('uid');

    const querySnapshot = await getDocs(collection(db, this.uid));
     querySnapshot.forEach((doc: any) => {
      this.listForEp.push(doc.data().details);
     })

     console.log(value)
    this.gogoAnimeGetDetails(value.id).then(async(result: any) => {
      result['listForEp'] = this.listForEp;
      result['isFrom'] = 'search';
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
