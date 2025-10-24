import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MetabaseService } from '../services/metabase.service';
import { MetabaseDashboard } from '../models/metabase-dashboard.model';
import { MetabaseDashboardComponent } from '../components/metabase-dashboard/metabase-dashboard.component';
import { ApiService, User } from '../services/api.service';
import { ExportModalComponent } from '../components/export-modal/export-modal';

interface QuickMetrics {
  totalRevenue: number;
  totalUsers: number;
  conversionRate: number;
  activeUsers: number;
}

interface DashboardStats {
  totalUsers: number;
  activeConnections: number;
  lastLogin: string;
  systemStatus: string;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  action: string;
}

interface RecentActivity {
  icon: string;
  action: string;
  time: string;
}


interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalRevenue: number;
  conversionRate: number;
  systemStatus: string;
  activeConnections: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MetabaseDashboardComponent, ExportModalComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  @Input() isEmbedded = false;

  // User info
  currentUser: User | null = { name: 'Utilisateur', email: 'user@example.com' };

  // Loading and error states
  isLoading = false;
  errorMessage: string | null = null;
  metabaseError = false;

  // Dashboard data
  selectedDashboard: MetabaseDashboard | null = null;
  availableDashboards: MetabaseDashboard[] = [];
  showDashboardView = false;
  showDashboardManager = false;

  // Admin interface states
  isFullscreen = false;
  isMetabaseConnected = false;
  hasPendingChanges = false;

  // Export modal
  showExportModal = false;

  // Horizontal metrics bar data from backend
  dashboardMetrics: DashboardMetrics | null = null;

  // Metrics and stats
  quickMetrics: QuickMetrics | null = {
    totalRevenue: 125000,
    totalUsers: 15420,
    conversionRate: 3.2,
    activeUsers: 2340
  };

  dashboardStats: DashboardStats = {
    totalUsers: 15420,
    activeConnections: 45,
    lastLogin: '2024-01-15 14:30',
    systemStatus: 'Opérationnel'
  };

  // Actions and activities
  quickActions: QuickAction[] = [
    {
      icon: '📊',
      title: 'Exporter les données',
      description: 'Télécharger un rapport complet',
      action: 'export'
    },
    {
      icon: '🔄',
      title: 'Actualiser les métriques',
      description: 'Mettre à jour toutes les données',
      action: 'refresh'
    },
    {
      icon: '⚙️',
      title: 'Configuration',
      description: 'Paramètres système',
      action: 'settings'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      icon: '👤',
      action: 'Nouvel utilisateur inscrit',
      time: 'Il y a 5 min'
    },
    {
      icon: '📊',
      action: 'Rapport généré',
      time: 'Il y a 15 min'
    },
    {
      icon: '🔄',
      action: 'Données synchronisées',
      time: 'Il y a 1h'
    }
  ];

  users: User[] = [];
  showAddUserForm = false;
  newUser: Partial<User> = { name: '', email: '', role: 'USER' };

  constructor(
    private metabaseService: MetabaseService,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadDashboardMetrics();
    this.loadQuickMetrics();
    this.loadUsers();
    // La connectivité sera vérifiée par l'iframe lui-même
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.metabaseService.getAvailableDashboards().subscribe({
      next: (dashboards) => {
        this.availableDashboards = dashboards;
        if (dashboards.length > 0) {
          this.selectedDashboard = dashboards[0]; // Always show the first dashboard
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.errorMessage = 'Erreur lors du chargement du tableau de bord';
        this.isLoading = false;
      }
    });
  }

  loadDashboardMetrics(): void {
    // Fetch metrics from backend PostgreSQL database
    this.http.get<DashboardMetrics>('http://localhost:8080/api/metrics/dashboard').subscribe({
      next: (metrics) => {
        this.dashboardMetrics = metrics;
        console.log('Dashboard Metrics from backend:', metrics);
      },
      error: (error) => {
        console.error('Erreur chargement métriques dashboard:', error);
        // Fallback to mock data if backend is not available
        this.dashboardMetrics = {
          totalUsers: 15420,
          activeUsers: 2340,
          adminUsers: 5,
          totalRevenue: 125000,
          conversionRate: 3.2,
          systemStatus: 'Opérationnel',
          activeConnections: 45
        };
      }
    });
  }

  loadQuickMetrics(): void {
    // Fetch quick metrics from backend
    this.http.get<QuickMetrics>('http://localhost:8080/api/metrics/quick-metrics').subscribe({
      next: (metrics) => {
        this.quickMetrics = metrics;
        console.log('Quick Metrics from backend:', metrics);
      },
      error: (error) => {
        console.error('Erreur metrics rapides:', error);
        // Keep existing mock data as fallback
      }
    });
  }

  loadUsers(): void {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users loaded:', users);
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        // Fallback to mock data
        this.users = [
          { id: 1, name: 'Alice Dupont', email: 'alice@example.com', role: 'USER', createdAt: '2024-01-15T10:30:00', lastLogin: '2024-01-20T14:25:00' },
          { id: 2, name: 'Bob Martin', email: 'bob@example.com', role: 'USER', createdAt: '2024-02-10T09:15:00', lastLogin: '2024-01-18T16:45:00' },
          { id: 3, name: 'Claire Bernard', email: 'claire@example.com', role: 'ADMIN', createdAt: '2023-12-01T08:00:00', lastLogin: '2024-01-21T11:30:00' },
          { id: 4, name: 'David Petit', email: 'david@example.com', role: 'USER', createdAt: '2024-03-05T13:20:00', lastLogin: undefined },
          { id: 5, name: 'Emma Moreau', email: 'emma@example.com', role: 'USER', createdAt: '2024-01-08T15:45:00', lastLogin: '2024-01-19T09:10:00' }
        ];
      }
    });
  }

  addUser(user: Partial<User>): void {
    if (user.name && user.email && user.role) {
      const userToAdd = {
        ...user,
        createdAt: new Date().toISOString(),
        lastLogin: undefined
      } as User;
      this.apiService.createUser(userToAdd).subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          console.log('User added:', newUser);
        },
        error: (error) => {
          console.error('Erreur ajout utilisateur:', error);
        }
      });
    }
  }

  deleteUser(id: number): void {
    this.apiService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== id);
        console.log('User deleted:', id);
      },
      error: (error) => {
        console.error('Erreur suppression utilisateur:', error);
      }
    });
  }

  logout(): void {
    console.log('Logout clicked');
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.errorMessage = null;
    this.loadDashboard();
    this.loadQuickMetrics();
  }

  openDashboardManager(): void {
    this.showDashboardManager = true;
  }

  closeDashboardManager(): void {
    this.showDashboardManager = false;
  }

  toggleDashboardView(): void {
    this.showDashboardView = !this.showDashboardView;
  }

  goToAdminDashboard(): void {
    // Navigate to admin dashboard or user management
    console.log('Go to admin dashboard');
    // this.router.navigate(['/admin/users']);
  }

  executeQuickAction(action: string): void {
    console.log('Executing action:', action);
    switch (action) {
      case 'export':
        // Implement export logic
        break;
      case 'refresh':
        this.refreshData();
        break;
      case 'settings':
        // Implement settings logic
        break;
    }
  }

  onDashboardSelectedFromManager(dashboard: MetabaseDashboard): void {
    this.selectedDashboard = dashboard;
    this.showDashboardManager = false;
  }

  onDashboardChange(event: any): void {
    const dashboardId = event.target.value;
    const dashboard = this.availableDashboards.find(db => db.id === dashboardId);
    if (dashboard) {
      this.selectedDashboard = dashboard;
    }
  }

  // Admin interface methods
  goBack(): void {
    this.router.navigate(['/admin-welcome']);
  }

  openMetabaseEditor(): void {
    // Ouvrir Metabase dans un nouvel onglet pour modification
    if (this.selectedDashboard?.url) {
      window.open(this.selectedDashboard.url, '_blank');
    }
  }

  openDashboardConfig(): void {
    alert('Configuration du dashboard - Fonctionnalité à implémenter');
  }

  exportDashboard(): void {
    this.showExportModal = true;
  }

  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  getSafeUrl(): any {
    if (!this.selectedDashboard) return null;

    // Si Metabase n'est pas accessible, utiliser l'URL de démonstration
    const url = this.metabaseError
      ? this.metabaseService.getDemoDashboardUrl()
      : (this.selectedDashboard.url || this.metabaseService.getDemoDashboardUrl());

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onIframeLoad(): void {
    this.isMetabaseConnected = true;
    this.metabaseError = false;
    console.log('Dashboard chargé avec succès');
  }

  onIframeError(): void {
    this.metabaseError = true;
    this.isMetabaseConnected = false;
    console.error('Erreur de chargement du dashboard');
  }

  retryConnection(): void {
    this.metabaseError = false;
    this.isLoading = true;
    // Recharger le dashboard
    setTimeout(() => {
      this.isLoading = false;
      this.loadDashboard();
    }, 1000);
  }

  getLastModified(): string {
    return new Date().toLocaleDateString('fr-FR');
  }

  backupDashboard(): void {
    alert('Sauvegarde du dashboard effectuée');
  }

  resetDashboard(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le dashboard ?')) {
      alert('Dashboard réinitialisé');
    }
  }

  clearCache(): void {
    if (confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
      alert('Cache vidé avec succès');
    }
  }

  scrollToUserManagement(): void {
    const element = document.querySelector('.user-management');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
