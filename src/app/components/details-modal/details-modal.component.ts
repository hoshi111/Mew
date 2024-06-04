import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent  implements OnInit {
  @Input() state: any;
  data: any = [];
  genres: string = '';
  epList: any = [];
  watchedEp: any = [];
  localstorage = localStorage;

  constructor(private router: Router,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private loaderService: LoaderService,
              private platform: Platform
  ) {
    // this.platform.backButton.subscribe(() => {
    //   this.modalCtrl.dismiss();
    // });
  }

  ngOnInit() {
    console.log(this.state);


    this.watchedEp = [];
    this.state.listForEp.forEach((data: any) => {
      if (data.title == this.state.title) {
        this.watchedEp.push({
          number: data.epNumber,
          isFinished: data.isFinished
        });
      }
    })
    this.state['watchedEp'] = this.watchedEp;

    console.log(this.state)




    this.epList = [];
    let flag = false;
    if(this.state.watchedEp) {
      this.state.episodes.forEach((ep: any) => {
        this.state.watchedEp.forEach((watchedEp: any) => {
          if (ep.number == watchedEp.number) {
            console.log('true');
            this.epList.push({
              ep: ep,
              isWatched: true,
              isFinished: watchedEp.isFinished
            })
            flag = true;
          }
        })
        if (!flag) {
          this.epList.push({
            ep: ep,
            isWatched: false
          })
        }
        
        flag = false;
      })
    }

    console.log(this.epList);

    this.state.genres.forEach((genre: any) => {
      this.genres = this.genres + genre + ', ';
    })
    this.genres = this.genres.slice(0, -2)
    console.log(this.genres)
  }

  playEpisode(episode: any) {
    episode['title'] = this.state.title;
    episode['image'] = this.state.image;
    episode['isFrom'] = this.state.isFrom;
    console.log(this.data)
    
    // this.navCtrl.navigateForward('player', { state: episode });
    const queryParams: any = {};

    queryParams.value = JSON.stringify(episode.id);
    console.log(queryParams)

    let navigationExtras: NavigationExtras = {};

    navigationExtras = {queryParams};

    this.router.navigate(['player'], navigationExtras);

    this.modalCtrl.dismiss();
  }

}
