import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  localstorage = localStorage;
  constructor(private router: Router) { }

  canActivate(): boolean {
    if (this.localstorage.getItem('uid')) {
      return true;
    }

    this.router.navigateByUrl('login');
    return false;
  }
};