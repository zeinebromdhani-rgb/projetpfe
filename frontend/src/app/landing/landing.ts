import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']  // ✅ Correction ici : "styleUrls" avec un "s"
})
export class LandingComponent implements OnInit {
  features = [
    {
      icon: '📊',
      title: 'Tableaux de bord interactifs',
      description: 'Créez et personnalisez vos tableaux de bord avec des visualisations dynamiques'
    },
    {
      icon: '🔒',
      title: 'Sécurité avancée',
      description: 'Vos données sont protégées avec un système d\'authentification robuste'
    },
    {
      icon: '⚡',
      title: 'Performance optimale',
      description: 'Accédez à vos données rapidement grâce à notre infrastructure optimisée'
    },
    {
      icon: '📱',
      title: 'Multi-plateforme',
      description: 'Accédez à vos tableaux de bord depuis n\'importe quel appareil'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Redirection si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if ((user?.role as string) === 'ADMIN') {
        this.router.navigate(['/admin-dashboard']);
      } else if ((user?.role as string) === 'USER') {
        this.router.navigate(['/user-dashboard']);
      }
    }
  }

  goToUserWelcome(): void {
    this.router.navigate(['/login']);
  }

  goToAdminWelcome(): void {
    this.router.navigate(['/register']);
  }

  scrollToFeatures(): void {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
