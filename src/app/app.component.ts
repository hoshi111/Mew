import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  localstorage = localStorage;
  constructor(private router: Router) {
    if (!this.localstorage.getItem('uid')) {
      this.router.navigate(['']);
    }
   }
   
}
