import { Component, OnInit } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../app.component';
import { Subscription } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LoaderService } from '../api/loader.service';
import { ModalController, NavController } from '@ionic/angular';
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
              private modalCtrl: ModalController,
              private navCtrl: NavController

  ) { }

  async ngOnInit() {
    this.loaderService.showLoader();
    this.uid = this.localstorage.getItem('uid');
    await this.fetchData().then(() => {
      this.loaderService.hideLoader();
    });
  }

  async fetchData() {
    let flag = false;
    const querySnapshot = await getDocs(collection(db, this.uid));
     querySnapshot.forEach((doc: any) => {
      this.tempList.forEach((t: any | undefined) => {
        if (t == doc.data().details.title) {
          flag = true;
        }
      })
      
      if(!flag) {
        this.tempList.push(doc.data().details.title);
        
      }

      else {
        flag = false;
      }
      })
      console.log(this.tempList)

    // let size = this.tempList.length;
    
    // for (let z = 0; z < size; z++) {
    //   for (let i = z + 1; i < size; i++) {
        
    //     if (this.tempList[z] == this.tempList[i]) {
    //       console.log(this.tempList[z], ' === ', this.tempList[i])
    //       for (let k = i; k < size -1; k++) {
    //         this.tempList[k] = Object.assign(this.tempList[k + 1]);
    //       }
    //       size--;
    //       i--;
    //     }
    //   }
    // }

    // this.tempList.length = size;
    // // console.log(this.tempList)

    this.tempList.forEach(async (data: any) => {
      await this.searchKeyword(data, 1).then(async (data1: any) => {
        // console.log(data1);
        await this.gogoAnimeGetDetails(data1.results[0].id).then((data2: any) => {
          this.list.push(data2);
        })
      })
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  async openDetailsModal(value: any) {
    this.loaderService.showLoader();
    // this.gogoAnimeGetDetails(value.id).then(async(result: any) => {
      const modal = await this.modalCtrl.create({
        component: DetailsModalComponent,
        componentProps: {state: value},
        breakpoints: [0, 0.6, 1],
        initialBreakpoint: 0.6,
        backdropDismiss: true,
        backdropBreakpoint: 0,
      });
      await modal.present().then(() => {
        this.loaderService.hideLoader();
      })
    // })
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
}
