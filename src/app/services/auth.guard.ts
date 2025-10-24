import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = JSON.parse(userJson);

    // Allow both ADMIN and USER roles to access protected pages
    if (user?.role === 'admin' || user?.role === 'user') {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
