import { Component, HostListener } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Router } from '@angular/router';
import { GoogleAuthProvider } from "firebase/auth";
import { LoaderService } from '../api/loader.service';

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
  localstorage = localStorage;

  constructor(private router: Router,
              private loaderService: LoaderService) { }

  ngOnInit() {
    this.auth = getAuth();
    this.error = document.getElementById('errorId') as HTMLDivElement;
    this.provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  }

  ionViewWillEnter() {
    if (this.localstorage.getItem('uid')) {
      this.router.navigate(['tabs']);
    }
  }

  @HostListener('document:keydown', ['$event'])

  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key == 'Enter') {
      this.login();
    }
  }

  login() {
    this.loaderService.showLoader();
    signInWithEmailAndPassword(this.auth, this.email, this.password).then((userCredential: any) => {
      
      this.localstorage.setItem('uid', userCredential.user.uid)
      this.localstorage.setItem('name', userCredential.user.displayName);

      this.router.navigate(['tabs']);
    })
    .catch(() => {
      this.email = '';
      this.password = ''
      this.error?.classList.remove('errorHidden');
      this.error?.classList.add('error')
    }).then(() => {
      this.loaderService.hideLoader();
    });
  }

  loginGoogle() {
    this.loaderService.showLoader();
    signInWithPopup(this.auth, this.provider).then((result: any) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    if(user) {
      var localstorage = localStorage;
      localstorage.setItem('uid', user.uid);
      localstorage.setItem('name', user.displayName);
      localstorage.setItem('profileImg', user.photoURL);

      this.router.navigate(['tabs']).then(() => {
        this.loaderService.hideLoader();
      });
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
    }).then(() => {
      this.loaderService.hideLoader();
    });
  }

  signUpPage() {
    this.router.navigate(['signup']);
  }
}
