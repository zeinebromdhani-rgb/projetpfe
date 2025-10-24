import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ExportOptions {
  format: 'pdf';
  includeFilters?: boolean;
  includeTitle?: boolean;
  quality?: 'low' | 'medium' | 'high';
  orientation?: 'portrait' | 'landscape';
}


@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private metabaseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Export dashboard from Metabase
  exportDashboard(dashboardId: number, options: ExportOptions): Observable<Blob> {
    const url = `${this.metabaseUrl}/api/dashboard/${dashboardId}/export`;

    const params = new URLSearchParams();
    params.append('format', options.format);
    if (options.includeFilters !== undefined) params.append('includeFilters', options.includeFilters.toString());
    if (options.includeTitle !== undefined) params.append('includeTitle', options.includeTitle.toString());
    if (options.quality) params.append('quality', options.quality);
    if (options.orientation) params.append('orientation', options.orientation);

    const headers = new HttpHeaders({
      'Accept': this.getMimeType(options.format),
      'Authorization': 'Bearer ' + this.getAuthToken() // Would need proper auth
    });

    return this.http.get(`${url}?${params.toString()}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(() => {
        // Fallback: simulate PDF generation
        return this.generateMockPDF(dashboardId, options);
      })
    );
  }

  // Export question/card from Metabase
  exportQuestion(questionId: number, options: ExportOptions): Observable<Blob> {
    const url = `${this.metabaseUrl}/api/card/${questionId}/export`;

    const params = new URLSearchParams();
    params.append('format', options.format);
    if (options.includeFilters !== undefined) params.append('includeFilters', options.includeFilters.toString());
    if (options.quality) params.append('quality', options.quality);
    if (options.orientation) params.append('orientation', options.orientation);

    const headers = new HttpHeaders({
      'Accept': this.getMimeType(options.format)
    });

    return this.http.get(`${url}?${params.toString()}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(() => {
        // Fallback: simulate export
        return this.generateMockExport(questionId, options);
      })
    );
  }



  // Download file helper
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Get MIME type for format
  private getMimeType(format: string): string {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[format as keyof typeof mimeTypes] || 'application/octet-stream';
  }

  // Get auth token (would need proper implementation)
  private getAuthToken(): string {
    return localStorage.getItem('metabase_token') || '';
  }

  // Mock PDF generation for demo
  private generateMockPDF(dashboardId: number, options: ExportOptions): Observable<Blob> {
    // Create a simple PDF-like blob for demo
    const pdfContent = `
      PDF Export - Dashboard ${dashboardId}
      Format: ${options.format}
      Quality: ${options.quality || 'medium'}
      Orientation: ${options.orientation || 'portrait'}
      Generated: ${new Date().toLocaleString('fr-FR')}
    `;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return of(blob);
  }

  // Mock export generation
  private generateMockExport(itemId: number, options: ExportOptions): Observable<Blob> {
    const content = `Export - Item ${itemId} - Format: ${options.format}`;
    const blob = new Blob([content], { type: this.getMimeType(options.format) });
    return of(blob);
  }

  // Get export filename
  getExportFilename(prefix: string, format: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${prefix}_${timestamp}.${format}`;
  }
}
