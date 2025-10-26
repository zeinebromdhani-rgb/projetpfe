import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { User } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private router: Router,
  ) {
    this.checkStoredAuth();
  }

  setAuthenticatedUserFromBackend(me: User): void {
    // Normalize backend role "ROLE_ADMIN" -> "admin"
    const normalizedRole = me.role?.replace(/^ROLE_/, '').toLowerCase();

    const authUser: User = {
      id: me.id,
      name: me.name,
      email: me.email,
      role: normalizedRole,
    };

    // Persist for reload / guards
    localStorage.setItem('currentUser', JSON.stringify(authUser));

    // Update reactive state
    this.currentUserSubject.next(authUser);
    this.isLoggedInSubject.next(true);

    // Centralized redirection
    const redirectRoute = this.getRedirectRouteForRole(normalizedRole);
    this.router.navigate([redirectRoute]);
  }

  private getRedirectRouteForRole(role: string | undefined): string {
    switch (role) {
      case 'admin':
        return '/admin-welcome';
      case 'user':
      default:
        return '/user-welcome';
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/landing']);
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
  }

  /**
   * Méthode existante : récupérer l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * ✅ Nouvelle méthode ajoutée : getAuthenticatedUser (alias)
   */
  getAuthenticatedUser(): User | null {
    return this.getCurrentUser(); // ou directement: return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}

