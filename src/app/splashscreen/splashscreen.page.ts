import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from "firebase/auth";

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
})
export class SplashscreenPage implements OnInit {
  localstorage = localStorage;

  constructor(private router: Router) { }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // const uid = user.uid;
        this.router.navigate(['tabs']);
      } else {
        this.router.navigate(['login']);
      }
    });
  }

  // ionViewWillEnter() {
  // //   const auth = getAuth();
  // //   onAuthStateChanged(auth, (user) => {
  // //     if (user) {
  // //       // const uid = user.uid;
  // //       this.router.navigate(['tabs']);
  // //     } else {
  // //       this.router.navigate(['login']);
  // //     }
  // //   });

  //   // if (this.localstorage.getItem('uid')) {
  //   //   this.router.navigate(['tabs']);
  //   // }

  //   // else {
  //   //   this.router.navigate(['login']);
  //   // }
    
  // }
}
