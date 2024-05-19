import { Component } from '@angular/core';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage{
  loginForm: any = FormGroup;
  auth: any;
  email: any;
  password: any;
  private error: HTMLDivElement | undefined;

  constructor(private router: Router
  ) {  }

  ngOnInit() {
    this.auth = getAuth();
    this.error = document.getElementById('errorId') as HTMLDivElement;
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
}
