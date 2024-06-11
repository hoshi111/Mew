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

    this.epList = [];
    let flag = false;
    if(this.state.watchedEp) {
      if (this.state.isKdrama) {
        this.localstorage.setItem('isKdrama', 'true');
        this.state.episodes.forEach((ep: any) => {
          this.state.watchedEp.forEach((watchedEp: any) => {
            if (ep.episode == watchedEp.number) {
              this.epList.push({
                ep: {
                  id: ep.id,
                  number: ep.episode
                },
                isWatched: true,
                isFinished: watchedEp.isFinished
              })
              flag = true;
            }
          })
          if (!flag) {
            this.epList.push({
              ep: {
                id: ep.id,
                number: ep.episode
              },
              isWatched: false
            })
          }
          
          flag = false;
        })
      }
      
      else {
        this.localstorage.setItem('isKdrama', 'false');
        this.state.episodes.forEach((ep: any) => {
          this.state.watchedEp.forEach((watchedEp: any) => {
            if (ep.number == watchedEp.number) {
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
    }


    this.state.genres.forEach((genre: any) => {
      this.genres = this.genres + genre + ', ';
    })
    this.genres = this.genres.slice(0, -2)
  }

  playEpisode(episode: any) {
    episode['title'] = this.state.title;
    episode['image'] = this.state.image;
    episode['isFrom'] = this.state.isFrom;
    episode['dramaId'] = this.state.id
    
    // this.navCtrl.navigateForward('player', { state: episode });
    const queryParams: any = {};

    queryParams.value = JSON.stringify(episode.id);

    let navigationExtras: NavigationExtras = {};

    navigationExtras = {queryParams};

    this.router.navigate(['player'], navigationExtras);

    this.modalCtrl.dismiss();
  }

}
