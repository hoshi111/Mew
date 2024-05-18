import { Component } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';

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

  constructor(private apiService: ApiService,
              private router: Router,
              private modalCtrl: ModalController
  ) {}

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
    this.gogoAnimeGetDetails(value.id).then(async(result: any) => {
      const modal = await this.modalCtrl.create({
        component: DetailsModalComponent,
        componentProps: {state: result},
        breakpoints: [0, 0.6, 1],
        initialBreakpoint: 0.6,
        backdropDismiss: true,
        backdropBreakpoint: 0,
      });
      await modal.present();
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

  // showDetailsPage(movieDetail: any) {
  //   console.log(movieDetail)
  //   movieDetail.url = 'https://consumet-beige.vercel.app/anime/gogoanime/watch/' + movieDetail.id + '-episode-1'
  //   // const link = {
  //   //   link: 'https://vidsrc.to/embed/movie/' + movieDetail.id
  //   // }

  //   // movieDetail.push(link);

  //   // this.getVideo(movieDetail.id).then((result: any) => {
  //   //   movieDetail.push(link);
  //   // })

  //   const queryParams: any = {};

  //   queryParams.value = JSON.stringify(movieDetail);

  //   const navigationExtras: NavigationExtras = {queryParams}

  //   this.router.navigate(['details'], navigationExtras);
  // }
}
