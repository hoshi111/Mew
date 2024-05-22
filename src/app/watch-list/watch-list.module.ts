import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WatchListPageRoutingModule } from './watch-list-routing.module';

import { WatchListPage } from './watch-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WatchListPageRoutingModule
  ],
  declarations: [WatchListPage]
})
export class WatchListPageModule {}
