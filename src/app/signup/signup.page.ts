import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  email: any;
  password: any;
  firstName: any;
  lastName: any;
  auth: any = getAuth();


  constructor(private router: Router,
              private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  submit() {
    const name = this.firstName + ' ' + this.lastName;
    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
          // Signed up 
          const user = userCredential.user;
          updateProfile(this.auth.currentUser, {
            displayName: name
          }).then(() => {
            this.router.navigate(['login']);
          }).catch((error) => {
            // An error occurred
            // ...
          });
          // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert("Email already used!");
        // ..
      });
  }

  goBack() {
    this.navCtrl.back();
  }

}
