import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from "firebase/auth";
import { db } from '../app.component';
import { collection, doc, getDoc, getDocs, snapshotEqual } from 'firebase/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  localstorage = localStorage;
  name: any;
  profileImg: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.name = this.localstorage.getItem('name');
    this.profileImg = this.localstorage.getItem('profileImg');
    console.log(this.name);
    console.log(this.profileImg);
  }

  showWatchList() {
    this.router.navigate(['watch-list']);
  }

  logOut() {
    this.localstorage.removeItem('uid');
    this.localstorage.removeItem('name');
    this.localstorage.removeItem('user');
    this.localstorage.removeItem('profileImg');
    const auth = getAuth();
    signOut(auth).then(() => {
      this.router.navigate(['splashscreen']);
    }).catch((error) => {
      alert('Logout Failed!');
    });
  }
}
