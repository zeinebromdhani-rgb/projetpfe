import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { RoleService, UserRole, UserWithRole } from '../services/role.service';

export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  role?: UserRole;
  permissions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private router: Router,
    private roleService: RoleService
  ) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: AuthUser = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);

      // Mise à jour du rôle utilisateur
      if (user.role) {
        this.roleService.setCurrentUserRole(user.role);
      }
    }
  }

  login(user: AuthUser): void {
    const userWithRole: UserWithRole = this.roleService.getUserInfo(user.email);
    const role: UserRole = userWithRole.role;

    const enrichedUser: AuthUser = {
      id: userWithRole.id,
      name: userWithRole.name,
      email: userWithRole.email,
      role: role,
      permissions: userWithRole.permissions
    };

    localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
    this.currentUserSubject.next(enrichedUser);
    this.isLoggedInSubject.next(true);
    this.roleService.setCurrentUserRole(role);

    const redirectRoute = this.roleService.getRedirectRoute();
    this.router.navigate([redirectRoute]);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/landing']);
  }

  /**
   * Méthode existante : récupérer l'utilisateur courant
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * ✅ Nouvelle méthode ajoutée : getAuthenticatedUser (alias)
   */
  getAuthenticatedUser(): AuthUser | null {
    return this.getCurrentUser(); // ou directement: return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}

