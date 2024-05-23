import { Component } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Router } from '@angular/router';
import { GoogleAuthProvider } from "firebase/auth";


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage{
  auth: any;
  email: any;
  password: any;
  private error: HTMLDivElement | undefined;
  provider = new GoogleAuthProvider();

  constructor(private router: Router
  ) {  }

  ngOnInit() {
    this.auth = getAuth();
    this.error = document.getElementById('errorId') as HTMLDivElement;
    this.provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  }

  login() {
    signInWithEmailAndPassword(this.auth, this.email, this.password).then((userCredential) => {
      var localstorage = localStorage;
      localstorage.setItem('uid', userCredential.user.uid)
      console.log(localstorage.getItem('uid'));
      console.log('success')

      this.router.navigate(['tabs']);
    })
    .catch(() => {
      this.email = '';
      this.password = ''
      this.error?.classList.remove('errorHidden');
      this.error?.classList.add('error')
    });
  }

  loginGoogle() {
    signInWithPopup(this.auth, this.provider).then((result: any) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log(user)
    if(user) {
      var localstorage = localStorage;
      localstorage.setItem('uid', user.uid);
      localstorage.setItem('name', user.displayName);
      localstorage.setItem('profileImg', user.photoURL);
      console.log(localstorage.getItem('uid'));

      this.router.navigate(['tabs']);
    }
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  }
}
