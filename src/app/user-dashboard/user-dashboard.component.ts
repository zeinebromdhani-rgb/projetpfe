import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MetabaseService } from '../services/metabase.service';
import { AuthService } from '../services/auth.service';
import { MetabaseDashboard } from '../models/metabase-dashboard.model';
import { User } from '../services/api.service';
import { ExportModalComponent } from '../components/export-modal/export-modal';
import { RoleService, UserWithRole } from '../services/role.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

interface RecentActivity {
  icon: string;
  title: string;
  time: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ExportModalComponent, TranslatePipe],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  availableDashboards: MetabaseDashboard[] = [];
  selectedDashboard: MetabaseDashboard | null = null;
  currentUser: UserWithRole | null = null;
  isFullscreen = false;
  metabaseError = false;

  // Export modal
  showExportModal = false;

  private languageSubscription: Subscription | null = null;

  recentActivities: RecentActivity[] = [
    {
      icon: '📊',
      title: 'Consultation du tableau Ventes',
      time: 'Il y a 2 heures'
    },
    {
      icon: '📈',
      title: 'Rapport mensuel généré',
      time: 'Hier à 14:30'
    },
    {
      icon: '🔄',
      title: 'Données mises à jour',
      time: 'Il y a 3 jours'
    }
  ];

  constructor(
    private metabaseService: MetabaseService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = this.roleService.getUserInfo(user.email);
    }

    // Charger les dashboards
    this.metabaseService.getAvailableDashboards().subscribe(dashboards => {
      this.availableDashboards = dashboards;
      if (dashboards.length > 0) {
        this.selectedDashboard = dashboards[0];
        // Essayer de charger l'iframe directement
        this.metabaseError = false;
      }
    });

    // Subscribe to language changes to force re-rendering
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Force change detection by triggering a re-render
      this.forceUpdate();
    });
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private forceUpdate(): void {
    // Force Angular to detect changes by creating a new reference
    this.availableDashboards = [...this.availableDashboards];
  }

  goBack(): void {
    this.router.navigate(['/user-welcome']);
  }

  // Single dashboard - no selection needed
  selectDashboard(dashboard: MetabaseDashboard): void {
    this.selectedDashboard = dashboard;
  }

  getDashboardIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Ventes': '📈',
      'Utilisateurs': '👥',
      'Finance': '💰',
      'Marketing': '📢',
      'Système': '⚙️',
      'default': '📊'
    };
    return icons[name] || icons['default'];
  }

  getDashboardDescription(name: string): string {
    const descriptions: { [key: string]: string } = {
      'Ventes': 'Analyse des performances commerciales',
      'Utilisateurs': 'Statistiques des utilisateurs actifs',
      'Finance': 'Rapports financiers et budgétaires',
      'Marketing': 'Métriques de campagne marketing',
      'Système': 'Monitoring système et performances',
      'default': 'Tableau de bord personnalisé'
    };
    return descriptions[name] || descriptions['default'];
  }

  refreshDashboard(): void {
    // Refresh the current dashboard
    console.log('Refreshing dashboard...');
    // In a real implementation, this would refresh the iframe or data
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  exportData(): void {
    this.openExportModal();
  }


  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  openMetabaseInNewTab(): void {
    if (this.selectedDashboard?.url) {
      window.open(this.selectedDashboard.url, '_blank');
    }
  }


  openSettings(): void {
    this.router.navigate(['/user-profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }

  onIframeLoad(): void {
    this.metabaseError = false;
  }

  onIframeError(): void {
    console.log('Metabase iframe failed to load - showing external link option');
    this.metabaseError = true;
  }

  retryConnection(): void {
    this.metabaseError = false;
    // Force reload of the iframe by changing the URL temporarily
    if (this.selectedDashboard) {
      const currentUrl = this.selectedDashboard.url;
      this.selectedDashboard.url = '';
      setTimeout(() => {
        if (this.selectedDashboard) {
          this.selectedDashboard.url = currentUrl;
        }
      }, 100);
    }
  }

  getSafeUrl(): SafeResourceUrl | null {
    if (!this.selectedDashboard) return null;

    // Si Metabase n'est pas accessible, utiliser l'URL de démonstration
    const url = this.metabaseError
      ? this.metabaseService.getDemoDashboardUrl()
      : (this.selectedDashboard.url || this.metabaseService.getDemoDashboardUrl());

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
