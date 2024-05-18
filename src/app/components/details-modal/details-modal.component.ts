import { Component, Input, OnInit, input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent  implements OnInit {
  @Input() state: any;
  data: any = [];

  constructor(private router: Router,
              private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log(this.state)
  }

  playEpisode(episode: any) {
    episode['title'] = this.state.title;
    episode['image'] = this.state.image;
    console.log(this.data)
    

    const queryParams: any = {};

    queryParams.value = JSON.stringify(episode);
    console.log(queryParams)

    const navigationExtras: NavigationExtras = {queryParams}

    this.router.navigate(['player'], navigationExtras);

    this.modalCtrl.dismiss();
  }

}
