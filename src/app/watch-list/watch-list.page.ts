import { Component, OnInit } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../app.component';
import { Subscription } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LoaderService } from '../api/loader.service';
import { ModalController } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';

@Component({
  selector: 'app-watch-list',
  templateUrl: './watch-list.page.html',
  styleUrls: ['./watch-list.page.scss'],
})
export class WatchListPage implements OnInit {
  localstorage = localStorage;
  uid: any;
  public subscription: any = Subscription;
  tempList: any = [];
  list: any = [];

  constructor(private apiService: ApiService,
              private loaderService: LoaderService,
              private modalCtrl: ModalController

  ) { }

  ngOnInit() {
    this.uid = this.localstorage.getItem('uid');
    this.fetchData();
  }

  async fetchData() {
    // const querySnapshot = await getDocs(collection(db, 'watchHistory', this.uid, 'forFetching'));
    // querySnapshot.forEach((doc: any) => {
    //   console.log(doc.ref.parent.parent.id);
    // });

    const querySnapshot = await getDocs(collection(db, this.uid));
     querySnapshot.forEach((doc: any) => {
      // console.log(doc.id)
      // console.log(doc.data());
      // console.log(doc.data().details.title);
      this.tempList.push(doc.data())
      // this.list.forEach((value: any) => {
      //   if (doc.data().details.title) {

      //   }
      })
      // this.searchKeyword(doc.data().details.title, 1).then(async(result: any) => {
      //   console.log(result);
      // })
    // });

    // const test = doc(db, this.uid,'title');
    // console.log(test.data());

    this.tempList.forEach((value: any) => {
      console.log(value.details.title)
      this.list.forEach((value1: any) => {
        if (value.details.title != value1.details.title) {
          this.list.push(value);
        }

        else {
          console.log('false')
        }
      })
    })

    console.log(this.list)
  }

  // async openDetailsModal(value: any) {
  //   this.loaderService.showLoader();
  //   // this.gogoAnimeGetDetails(value.id).then(async(result: any) => {
  //     const modal = await this.modalCtrl.create({
  //       component: DetailsModalComponent,
  //       componentProps: {state: result},
  //       breakpoints: [0, 0.6, 1],
  //       initialBreakpoint: 0.6,
  //       backdropDismiss: true,
  //       backdropBreakpoint: 0,
  //     });
  //     await modal.present().then(() => {
  //       this.loaderService.hideLoader();
  //     })
  //   // })
  // }

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
}
