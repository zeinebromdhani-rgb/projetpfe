import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportOptions } from '../../services/export.service';

@Component({
  selector: 'app-export-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './export-modal.html',
  styleUrl: './export-modal.css'
})
export class ExportModalComponent {
  @Input() isVisible = false;
  @Input() dashboardId: number | null = null;
  @Input() dashboardName = '';
  @Output() closeModal = new EventEmitter<void>();

  isExporting = false;
  exportSuccess = false;

  // Export options
  exportOptions: ExportOptions = {
    format: 'pdf',
    includeFilters: true,
    includeTitle: true,
    quality: 'high',
    orientation: 'landscape'
  };

  constructor(private exportService: ExportService) {}

  close() {
    this.closeModal.emit();
    this.resetState();
  }

  exportDashboard() {
    // Open the dashboard in Metabase for manual export
    const dashboardUrl = 'http://localhost:3000/public/dashboard/f84bd93e-4ced-4e8d-9f89-4103eabb7946';
    window.open(dashboardUrl, '_blank');

    // Show success message
    this.exportSuccess = true;
    setTimeout(() => {
      alert(`Dashboard ouvert dans Metabase. Utilisez les options d'export intégrées de Metabase pour exporter en ${this.exportOptions.format.toUpperCase()}.`);
    }, 1000);
  }

  private resetState() {
    this.isExporting = false;
    this.exportSuccess = false;
  }
}