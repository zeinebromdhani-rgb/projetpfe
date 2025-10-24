import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour ngIf et ngFor
import { RoleService, UserWithRole, UserRole } from '../services/role.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule], // Import nécessaire pour les directives Angular
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  allUsers: UserWithRole[] = [];

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.allUsers = this.roleService.getAllUsers();
  }

  promoteToAdmin(user: UserWithRole): void {
    const success = this.roleService.updateUserRole(user.id!, UserRole.ADMIN);
    if (success) {
      alert(`${user.name} est maintenant administrateur !`);
      this.ngOnInit(); // Refresh
    } else {
      alert('Permission refusée.');
    }
  }

  demoteToUser(user: UserWithRole): void {
    const success = this.roleService.updateUserRole(user.id!, UserRole.USER);
    if (success) {
      alert(`${user.name} est maintenant un simple utilisateur.`);
      this.ngOnInit(); // Refresh
    } else {
      alert('Permission refusée.');
    }
  }
}
