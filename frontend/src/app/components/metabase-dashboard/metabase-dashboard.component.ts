import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MetabaseService } from '../../services/metabase.service';
import { MetabaseDashboard } from '../../models/metabase-dashboard.model';

@Component({
  selector: 'app-metabase-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metabase-dashboard-wrapper" [class.fullscreen]="isFullscreen">
      <div class="dashboard-toolbar">
        <span class="dashboard-title">{{ dashboard?.name || 'Dashboard' }}</span>
        <div class="toolbar-actions">
          <button (click)="refreshDashboard()">🔄 Actualiser</button>
          <button (click)="toggleFullscreen()">
            {{ isFullscreen ? '❌ Quitter plein écran' : '⛶ Plein écran' }}
          </button>
        </div>
      </div>

      <div class="dashboard-iframe-container" *ngIf="safeEmbedUrl">
        <iframe
          [src]="safeEmbedUrl"
          [attr.height]="height"
          width="100%"
          frameborder="0"
          allowtransparency="true"
          allowfullscreen
          loading="lazy"
          [title]="dashboard?.name || 'Metabase Dashboard'">
        </iframe>
      </div>

      <div *ngIf="!safeEmbedUrl" class="error-message">
        <p>⚠️ Aucune URL disponible pour ce dashboard.</p>
      </div>
    </div>
  `,
  styles: [`
    .metabase-dashboard-wrapper {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-top: 1rem;
      position: relative;
      background: #fff;
    }

    .dashboard-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: #f8f8f8;
      border-bottom: 1px solid #e0e0e0;
    }

    .dashboard-title {
      font-weight: bold;
    }

    .toolbar-actions button {
      margin-left: 0.5rem;
      background: #eee;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .dashboard-iframe-container iframe {
      display: block;
      width: 100%;
      border: none;
    }

    .fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 1000;
      background: white;
    }

    .error-message {
      padding: 1rem;
      color: red;
      text-align: center;
    }
  `]
})
export class MetabaseDashboardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dashboard: MetabaseDashboard | null = null;
  @Input() showHeader: boolean = true;
  @Input() height: string = '600px';

  isLoading = true;
  error = false;
  isFullscreen = false;

  safeEmbedUrl: SafeResourceUrl | null = null;

  constructor(
    private metabaseService: MetabaseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.updateEmbedUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboard']) {
      this.updateEmbedUrl();
    }
  }

  ngOnDestroy(): void {
    // nettoyage si besoin
  }

  refreshDashboard(): void {
    this.isLoading = true;

    // Recharge l'iframe visuellement (optionnel : reload avec un token)
    setTimeout(() => {
      this.updateEmbedUrl();
      this.isLoading = false;
    }, 500);
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private updateEmbedUrl(): void {
    if (this.dashboard?.embedUrl) {
      this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dashboard.embedUrl);
    } else {
      this.safeEmbedUrl = null;
    }
  }
}
