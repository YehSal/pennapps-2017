import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    // check to see if user has valid jmt
    if (tokenNotExpired()) {
      console.log('User is logged in')
      return true;
    }
    // otherwise, redirect to login
    this.router.navigate(['/login'])
    return false;
  }
}
