import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisualizationRequest, VisualizationResult } from '../models/visualization-request.model';

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {
  private apiUrl = 'http://localhost:8080/api/visualization';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Generate visualization from natural language query
   * This calls the backend which simulates the n8n workflow
   */
  generateVisualization(request: VisualizationRequest): Observable<VisualizationResult> {
    return this.http.post<VisualizationResult>(`${this.apiUrl}/generate`, request, this.httpOptions);
  }

  /**
   * Health check for visualization service
   */
  healthCheck(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' });
  }
}