import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService, User } from '../services/api.service';

interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  normalUsers: number;
}

@Component({
  selector: 'app-admin-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-welcome.html',
  styleUrls: ['./admin-welcome.css']
})
export class AdminWelcomeComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];

  adminStats: AdminStats = {
    totalUsers: 0,
    normalUsers: 0,
    adminUsers: 0
  };

  showUserManagement = false;
  showAddUserForm = false;
  showUserTable = false;

  newUser: Partial<User> = {
    name: '',
    email: '',
    role: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUsers();
  }

  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  private loadUsers(): void {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.recomputeStats();
        console.log('Users loaded:', users);
      },
      error: (err) => {
        console.error("Can't load users:", err);
      }
    });
  }

  private recomputeStats(): void {
    this.adminStats.totalUsers = this.users.length;
    this.adminStats.adminUsers = this.users.filter(u => u.role === 'ADMIN').length;
    this.adminStats.normalUsers = this.users.filter(u => u.role === 'USER').length;
  }

  isSelf(user: User): boolean {
    return this.currentUser?.id === user.id;
  }

  goToDashboard(): void {
    this.showUserTable = !this.showUserTable;
    if (this.showUserTable) {
      setTimeout(() => {
        const element = document.querySelector('.embedded-dashboard');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  openMetabaseDirect(): void {
    window.open(
      'http://localhost:3000/dashboard/97-tableau-de-bord-2-dupliquer?end-date=&id=&start-date=',
      '_blank'
    );
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
    this.newUser = { name: '', email: '', role: '' };
  }

  saveNewUser(): void {
    if (!this.newUser.name || !this.newUser.email) {
      alert('Veuillez remplir le nom et l’email.');
      return;
    }

    const userToAdd: User = {
      name: this.newUser.name.trim(),
      email: this.newUser.email.trim().toLowerCase(),
      role: this.newUser.role && this.newUser.role !== '' ? this.newUser.role : 'USER',
      password: 'changeme123' // required by backend /register
    };

    this.apiService.createUser(userToAdd).subscribe({
      next: (createdUser) => {
        // update table locally
        this.users.push(createdUser);
        this.recomputeStats();

        alert('Utilisateur créé avec succès.');
        this.cancelAddUser();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert("Erreur lors de la création de l'utilisateur.");
      }
    });
  }

  deleteUser(user: User): void {
    if (!user.id) return;

    if (this.isSelf(user)) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }

    const ok = confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`);
    if (!ok) return;

    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        // remove in UI
        this.users = this.users.filter(u => u.id !== user.id);
        this.recomputeStats();
        alert('Utilisateur supprimé.');
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert("Erreur lors de la suppression de l'utilisateur.");
      }
    });
  }

  changeUserRole(user: User, newRoleValue: string): void {
    if (!user.id) return;

    if (this.isSelf(user)) {
      alert("Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }

    const newRole = newRoleValue === 'ADMIN' ? 'ADMIN' : 'USER';

    this.apiService.updateUserRole(user.id, { role: newRole }).subscribe({
      next: () => {
        user.role = newRole; // reflect new role in UI
        this.recomputeStats();
        alert('Rôle mis à jour.');
      },
      error: (error) => {
        console.error('Error updating role:', error);
        alert("Erreur lors de la modification du rôle.");
      }
    });
  }

  getRoleLabel(role: string | undefined): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  }

  getRoleColor(role: string | undefined): string {
    return role === 'ADMIN' ? '#FF5722' : '#2196F3';
  }
}
