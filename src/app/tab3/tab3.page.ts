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
  uid: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.uid = this.localstorage.getItem('uid');
    this.fetchData();
  }

  async fetchData() {
    // const querySnapshot = await getDocs(collection(db, 'watchHistory', this.uid, 'forFetching'));
    // querySnapshot.forEach((doc: any) => {
    //   console.log(doc.ref.parent.parent.id);
    // });

    const querySnapshot = await getDocs(collection(db, this.uid));
     querySnapshot.forEach((doc: any) => {
      console.log(doc.id)
      console.log(doc.data());
      console.log(doc.data().details.title);
    });

    // const test = doc(db, this.uid,'title');
    // console.log(test.data());

  }

  logOut() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.router.navigate(['splashscreen']);
    }).catch((error) => {
      alert('Logout Failed!');
    });
  }
}
