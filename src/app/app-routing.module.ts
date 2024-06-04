import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/api/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'player',
    loadChildren: () => import('./player/player.module').then( m => m.PlayerPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'splashscreen',
    loadChildren: () => import('./splashscreen/splashscreen.module').then( m => m.SplashscreenPageModule)
  },
  {
    path: 'watch-list',
    loadChildren: () => import('./watch-list/watch-list.module').then( m => m.WatchListPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  }




];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
