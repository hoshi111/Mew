import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WatchListPage } from './watch-list.page';

const routes: Routes = [
  {
    path: '',
    component: WatchListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WatchListPageRoutingModule {}
