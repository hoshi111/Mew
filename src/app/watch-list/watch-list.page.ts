import { Component, OnInit } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LoaderService } from '../api/loader.service';
import { ModalController, NavController } from '@ionic/angular';
import { DetailsModalComponent } from '../components/details-modal/details-modal.component';
import { db } from 'src/environments/environment';


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
  watchedEp: any = [];
  listForEp: any = [];

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

  goBack() {
    this.navCtrl.back();
  }

  async openDetailsModal(value: any) {
    this.loaderService.showLoader();
    this.watchedEp = [];
    this.listForEp.forEach((data: any) => {
      if (data.title == value.title) {
        this.watchedEp.push(data.epNumber);
      }
    })
    value['watchedEp'] = this.watchedEp;

    console.log(value)
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
