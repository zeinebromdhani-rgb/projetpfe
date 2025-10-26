import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { User } from '../services/api.service';

interface UserStats {
  totalDashboards: number;
  lastLogin: string;
  accountStatus: string;
}

@Component({
  selector: 'app-user-welcome',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './user-welcome.html',
  styleUrls: ['./user-welcome.css']
})
export class UserWelcomeComponent implements OnInit {
  currentUser: User | null = null;
  userStats: UserStats = {
    totalDashboards: 1,
    lastLogin: new Date().toLocaleDateString('fr-FR'),
    accountStatus: 'Actif'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  goToDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/user-profile']);
  }



  goToVisualization(): void {
    this.router.navigate(['/visualization']);
  }

  logout(): void {
    this.authService.logout();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
