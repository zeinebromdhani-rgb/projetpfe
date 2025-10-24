import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface UserWithRole {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  profilePhoto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentUserRoleSubject = new BehaviorSubject<UserRole>(UserRole.USER);
  public currentUserRole$ = this.currentUserRoleSubject.asObservable();

  private rolePermissions: { [key in UserRole]: string[] } = {
    [UserRole.ADMIN]: [
      'dashboard:manage',
      'dashboard:view',
      'dashboard:configure',
      'users:manage',
      'settings:modify',
      'metrics:view',
      'system:monitor'
    ],
    [UserRole.USER]: [
      'dashboard:view',
      'metrics:view'
    ]
  };

private demoUsers: UserWithRole[] = [];
private readonly STORAGE_KEY = 'app-users-data';

private defaultUsers: UserWithRole[] = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@monsite.com',
    role: UserRole.ADMIN,
    permissions: this.rolePermissions[UserRole.ADMIN]
  },
  {
    id: 2,
    name: 'Administrateur',
    email: 'administrateur@monsite.com',
    role: UserRole.ADMIN,
    permissions: this.rolePermissions[UserRole.ADMIN]
  },
  {
    id: 3,
    name: 'Utilisateur',
    email: 'user@monsite.com',
    role: UserRole.USER,
    permissions: this.rolePermissions[UserRole.USER]
  },
  {
    id: 4,
    name: 'Zeineb',
    email: 'zeineb@monsite.com',
    role: UserRole.USER,
    permissions: this.rolePermissions[UserRole.USER]
  }
];

constructor() {
  this.loadUsersFromStorage();
}

  determineUserRole(email: string): UserRole {
    const user = this.demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) return user.role;

    if (email.includes('admin') || email.includes('administrateur')) return UserRole.ADMIN;
    return UserRole.USER;
  }

  getUserInfo(email: string): UserWithRole {
    const existingUser = this.demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) return existingUser;

    const role = this.determineUserRole(email);
    const name = this.extractNameFromEmail(email);

    return {
      name,
      email,
      role,
      permissions: this.rolePermissions[role]
    };
  }

  setCurrentUserRole(role: UserRole): void {
    this.currentUserRoleSubject.next(role);
  }

  getCurrentUserRole(): UserRole {
    return this.currentUserRoleSubject.value;
  }

  hasPermission(permission: string): boolean {
    const currentRole = this.getCurrentUserRole();
    return this.rolePermissions[currentRole].includes(permission);
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === UserRole.ADMIN;
  }

  isUser(): boolean {
    return this.getCurrentUserRole() === UserRole.USER;
  }

  getCurrentPermissions(): string[] {
    return this.rolePermissions[this.getCurrentUserRole()];
  }

  getAuthorizedDashboards(): string[] {
    return this.isAdmin()
      ? ['sales', 'users', 'finance', 'marketing', 'system', 'admin']
      : ['sales', 'users', 'finance', 'marketing'];
  }

  getPermissionsForRole(role: UserRole): string[] {
    return this.rolePermissions[role];
  }

  getRedirectRoute(): string {
    return this.isAdmin() ? '/admin-welcome' : '/user-welcome';
  }

  private extractNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // 🔥 Admin features
  getAllUsers(): UserWithRole[] {
    if (!this.hasPermission('users:manage')) return [];
    return this.demoUsers;
  }

  updateUserRole(userId: number, newRole: UserRole): boolean {
    if (!this.hasPermission('users:manage')) return false;

    const user = this.demoUsers.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      user.permissions = this.rolePermissions[newRole];
      this.saveUsersToStorage();
      return true;
    }
    return false;
  }

  deleteUserById(id: number): boolean {
    if (!this.hasPermission('users:manage')) return false;

    const index = this.demoUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.demoUsers.splice(index, 1);
      this.saveUsersToStorage();
      return true;
    }
    return false;
  }

  // Persistence methods
  private loadUsersFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        // Ensure permissions are properly set for each user
        this.demoUsers = parsedUsers.map((user: UserWithRole) => ({
          ...user,
          permissions: this.rolePermissions[user.role] || []
        }));
      } else {
        // Initialize with default users if no stored data
        this.demoUsers = [...this.defaultUsers];
        this.saveUsersToStorage();
      }
    } catch (error) {
      console.error('Error loading users from storage:', error);
      // Fallback to default users
      this.demoUsers = [...this.defaultUsers];
    }
  }

  private saveUsersToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.demoUsers));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  // Public method to update user and persist
  updateUser(userId: number, updatedUser: Partial<UserWithRole>): boolean {
    const userIndex = this.demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.demoUsers[userIndex] = {
        ...this.demoUsers[userIndex],
        ...updatedUser,
        permissions: this.rolePermissions[updatedUser.role || this.demoUsers[userIndex].role]
      };
      this.saveUsersToStorage();
      return true;
    }
    return false;
  }

  // Profile photo persistence
  saveProfilePhoto(userId: number, photoData: string): void {
    try {
      const photoKey = `profile-photo-${userId}`;
      localStorage.setItem(photoKey, photoData);
    } catch (error) {
      console.error('Error saving profile photo:', error);
    }
  }

  getProfilePhoto(userId: number): string | null {
    try {
      const photoKey = `profile-photo-${userId}`;
      return localStorage.getItem(photoKey);
    } catch (error) {
      console.error('Error loading profile photo:', error);
      return null;
    }
  }

  removeProfilePhoto(userId: number): void {
    try {
      const photoKey = `profile-photo-${userId}`;
      localStorage.removeItem(photoKey);
    } catch (error) {
      console.error('Error removing profile photo:', error);
    }
  }
}
