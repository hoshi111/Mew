import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

import { environment } from 'src/environments/environment';
export var db: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    db = getFirestore(app);
   }
}
