import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService, User } from '../services/api.service';
import { RoleService, UserWithRole, UserRole } from '../services/role.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  systemStatus: string;
}

@Component({
  selector: 'app-admin-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminDashboardComponent],
  templateUrl: './admin-welcome.html',
  styleUrls: ['./admin-welcome.css']
})
export class AdminWelcomeComponent implements OnInit {
  currentUser: UserWithRole | null = null;
  users: UserWithRole[] = [];
  adminStats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    systemStatus: 'Opérationnel'
  };

  showUserManagement = false;
  showAddUserForm = false;
  showUserTable = false;
  newUser: Partial<UserWithRole> = { name: '', email: '', role: UserRole.USER };

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUsers();
    this.loadStats();
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = this.roleService.getUserInfo(user.email);
    }
  }

  private loadUsers(): void {
    // Try backend first, fallback to role service
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.map(u => this.roleService.getUserInfo(u.email));
        this.updateStats();
      },
      error: () => {
        // Fallback to role service demo users
        this.users = this.roleService.getAllUsers();
        this.updateStats();
      }
    });
  }

  private loadStats(): void {
    this.updateStats();
  }

  private updateStats(): void {
    this.adminStats.totalUsers = this.users.length;
    this.adminStats.adminUsers = this.users.filter(u => u.role === UserRole.ADMIN).length;
    this.adminStats.activeUsers = Math.floor(this.adminStats.totalUsers * 0.7); // Mock active users
  }

  goToDashboard(): void {
    this.showUserTable = !this.showUserTable;
    if (this.showUserTable) {
      // Scroll to the embedded dashboard section after a short delay to allow rendering
      setTimeout(() => {
        const element = document.querySelector('.embedded-dashboard');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  openMetabaseDirect(): void {
    // Ouvrir Metabase dans un nouvel onglet pour modification
    window.open('http://localhost:3000/dashboard/97-tableau-de-bord-2-dupliquer?end-date=&id=&start-date=', '_blank');
  }

  logout(): void {
    this.authService.logout();
  }

  toggleUserManagement(): void {
    this.showUserManagement = !this.showUserManagement;
    if (this.showUserManagement) {
      this.loadUsers();
    }
  }

  addUser(): void {
    this.showAddUserForm = true;
  }

  cancelAddUser(): void {
    this.showAddUserForm = false;
    this.newUser = { name: '', email: '', role: UserRole.USER };
  }

  saveNewUser(): void {
    if (this.newUser.name && this.newUser.email) {
      const userToAdd: User = {
        name: this.newUser.name,
        email: this.newUser.email,
        role: this.newUser.role
      };

      this.apiService.createUser(userToAdd).subscribe({
        next: (createdUser) => {
          this.users.push(this.roleService.getUserInfo(createdUser.email));
          this.updateStats();
          this.cancelAddUser();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          // For demo, add to role service
          this.roleService.getAllUsers().push({
            name: this.newUser.name!,
            email: this.newUser.email!,
            role: this.newUser.role!
          } as UserWithRole);
          this.loadUsers();
          this.cancelAddUser();
        }
      });
    }
  }

  deleteUser(user: UserWithRole): void {
    if (user.id && confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.updateStats();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          // For demo, use role service
          if (user.id) {
            this.roleService.deleteUserById(user.id);
            this.loadUsers();
          }
        }
      });
    }
  }

  changeUserRole(user: UserWithRole, newRoleValue: string): void {
    const newRole = newRoleValue as UserRole;
    if (user.id) {
      const success = this.roleService.updateUserRole(user.id, newRole);
      if (success) {
        user.role = newRole;
        user.permissions = this.roleService.getPermissionsForRole(newRole);
        this.updateStats();
      }
    }
  }

  getRoleLabel(role: UserRole): string {
    return role === UserRole.ADMIN ? 'Administrateur' : 'Utilisateur';
  }

  getRoleColor(role: UserRole): string {
    return role === UserRole.ADMIN ? '#FF5722' : '#2196F3';
  }
}
