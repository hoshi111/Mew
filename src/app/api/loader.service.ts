import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isLoading = new BehaviorSubject(false);
  public loading: any;  
  
  constructor(public loadingController: LoadingController) {}

  async showHideAutoLoader() {
    this.loading = await this.loadingController.create({
      duration: 2500,
      backdropDismiss: true,
      cssClass: 'loader',
      spinner: 'lines'
    });
  
    await this.loading?.present();    
  };

  async showLoader() {
    this.loading = await this.loadingController.create({
      showBackdrop: false,
      cssClass: 'loader',
      spinner: 'lines'
    });
  
    await this.loading?.present();   
  };

  async hideLoader() {
    await this.loading?.dismiss();
  }
};
