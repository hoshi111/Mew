import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from "src/app/app.component";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    const querySnapshot = await getDocs(collection(db, "watchHistory"));
    var localstorage = localStorage;
    const uid = localstorage.getItem('uid');
    querySnapshot.forEach((data: any) => {
      // console.log(data.id, ' => ', data.data().episodes.uid);

      if (uid == data.data().episodes.uid) {
        console.log(data.id)
      }
    })
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
