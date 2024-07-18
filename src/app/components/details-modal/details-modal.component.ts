import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { LoaderService } from 'src/app/api/loader.service';
import { Filesystem, Directory, Encoding, DownloadFileResult, ProgressStatus } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { GlobalVariable } from 'src/app/api/global';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent  implements OnInit {
  data: any = [];
  genres: string = '';
  epList: any = [];
  watchedEp: any = [];
  localstorage = localStorage;
  isNativePlatform: boolean = false;

  constructor(private router: Router,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private loaderService: LoaderService,
              private platform: Platform,
              public global: GlobalVariable
  ) {
    // this.platform.backButton.subscribe(() => {
    //   this.modalCtrl.dismiss();
    // });
  }

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      this.isNativePlatform = true;
    }
    console.log(this.global.data.isKdrama, this.global.data.isManga)
    this.watchedEp = [];

    if (!this.global.data.isManga) {
      this.global.data.listForEp.forEach((data: any) => {
        if (data.title == this.global.data.title) {
          this.watchedEp.push({
            number: data.epNumber,
            isFinished: data.isFinished
          });
        }
      })
      this.global.data['watchedEp'] = this.watchedEp;
      console.log(this.watchedEp)
      console.log(this.global.data)
    }

    else {
      console.log(this.global.data.listForEp)
      this.global.data.listForEp.forEach((data: any) => {
        if (data.mangaId == this.global.mangaId) {
          this.watchedEp.push({
            number: data.chapterIndex,
            isOpened: data.opened
          });
        }
      })
      this.global.data['watchedEp'] = this.watchedEp;
      console.log(this.watchedEp)
    }

    this.epList = [];
    let flag = false;

    if(this.global.data.watchedEp) {
      if (this.global.data.isKdrama) {
        this.localstorage.setItem('isKdrama', 'true');
        this.localstorage.setItem('isManga', 'false');
        this.global.data.episodes.forEach((ep: any) => {
          this.global.data.watchedEp.forEach((watchedEp: any) => {
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

      else if (this.global.data.isManga) {
        this.localstorage.setItem('isKdrama', 'false');
        this.localstorage.setItem('isManga', 'true');
        console.log(this.global.data)

        for (let i = 0; i < this.global.data.chapters.length; i ++) {
          this.epList.push({
            id: this.global.data.chapters[i].id,
            title: this.global.data.chapters[i].title,
            opened: false
          })
        }

        this.global.data.watchedEp.forEach((ep: any) => {
          console.log(ep)
          this.epList[ep.number].opened = true
        })

        console.log(this.epList)
        // this.global.data.chapters.forEach((ep: any) => {
        //   this.global.data.watchedEp.forEach((watchedEp: any) => {
        //     if (ep.episode == watchedEp.number) {
        //       this.epList.push({
        //         ep: {
        //           id: ep.id,
        //           number: ep.episode
        //         },
        //         isWatched: true,
        //         isFinished: watchedEp.isFinished
        //       })
        //       flag = true;
        //     }
        //   })
        //   if (!flag) {
        //     this.epList.push({
        //       ep: {
        //         id: ep.id,
        //         number: ep.episode
        //       },
        //       isWatched: false
        //     })
        //   }
          
        //   flag = false;
        // })
      }
      
      else {
        this.localstorage.setItem('isKdrama', 'false');
        this.localstorage.setItem('isManga', 'false');
        this.global.data.episodes.forEach((ep: any) => {
          this.global.data.watchedEp.forEach((watchedEp: any) => {
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


    this.global.data.genres.forEach((genre: any) => {
      this.genres = this.genres + genre + ', ';
    })
    this.genres = this.genres.slice(0, -2)
  }

  playEpisode(episode: any) {
    episode['title'] = this.global.data.title;
    episode['image'] = this.global.data.image;
    episode['isFrom'] = this.global.data.isFrom;
    episode['dramaId'] = this.global.data.id
    
    // this.navCtrl.navigateForward('player', { state: episode });
    const queryParams: any = {};

    queryParams.value = JSON.stringify(episode.id);

    let navigationExtras: NavigationExtras = {};

    navigationExtras = {queryParams};

    this.router.navigate(['player'], navigationExtras);

    this.modalCtrl.dismiss();
  }

  readChapter(chapter: any) {
    console.log(chapter.id)

    const queryParams: any = {};

    queryParams.value = JSON.stringify(chapter.id);

    let navigationExtras: NavigationExtras = {};

    navigationExtras = {queryParams};

    this.router.navigate(['reader'], navigationExtras);

    this.modalCtrl.dismiss();
  }

  async downloadEpisodes() {
    // this.loaderService.showLoader();
    // const modal = await this.modalCtrl.create({
    //   component: DownloadModalComponent,
    //   componentProps: {state: this.global.data.episodes},
    //   breakpoints: [0, 0.6, 1],
    //   initialBreakpoint: 1,
    //   backdropDismiss: true,
    //   backdropBreakpoint: 0,
    // });
    // await modal.present().then(() => {
    //   this.loaderService.hideLoader();
    // });
  }

}
