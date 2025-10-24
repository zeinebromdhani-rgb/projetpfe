import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetabaseService } from '../services/metabase.service';
import { MetabaseDashboard } from '../models/metabase-dashboard.model';

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Ton code HTML inchangé -->
  `,
  styleUrls: ['./dashboard-manager.component.css'] // ✅ corrigé ici
})
export class DashboardManagerComponent implements OnInit {
  @Output() dashboardSelected = new EventEmitter<MetabaseDashboard>();
  @Output() managerClosed = new EventEmitter<void>();

  dashboards: MetabaseDashboard[] = [];
  metabaseConfig = {
    url: 'http://localhost:3000',
    apiKey: ''
  };

  connectionStatus = 'Connecté';
  lastSync = new Date();
  activeDashboardsCount = 0;

  constructor(private metabaseService: MetabaseService) {}

  ngOnInit(): void {
    this.loadDashboards();
    this.updateMetrics();
  }

  loadDashboards(): void {
    this.metabaseService.getDashboards().subscribe({
      next: (dashboards) => {
        this.dashboards = dashboards;
        this.updateMetrics();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dashboards:', error);
        this.connectionStatus = 'Erreur';
      }
    });
  }

  saveConfiguration(): void {
    this.metabaseService.configureMetabase(
      this.metabaseConfig.url, 
      this.metabaseConfig.apiKey
    );
    
    // Simuler la sauvegarde
    setTimeout(() => {
      this.connectionStatus = 'Connecté';
      this.lastSync = new Date();
      this.loadDashboards();
    }, 1000);
  }

  toggleDashboard(dashboard: MetabaseDashboard): void {
    dashboard.isActive = !dashboard.isActive;
    this.updateMetrics();
  }

  viewDashboard(dashboard: MetabaseDashboard): void {
    this.dashboardSelected.emit(dashboard);
  }

  refreshConnection(): void {
    this.connectionStatus = 'Synchronisation...';
    
    setTimeout(() => {
      this.connectionStatus = 'Connecté';
      this.lastSync = new Date();
      this.loadDashboards();
    }, 2000);
  }

  updateMetrics(): void {
    this.activeDashboardsCount = this.dashboards.filter(d => d.isActive).length;
  }

  close(): void {
    this.managerClosed.emit();
  }
}
