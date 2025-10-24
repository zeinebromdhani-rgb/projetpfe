import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MetabaseDashboard } from '../models/metabase-dashboard.model';

export interface MetabaseCol { name: string; display_name?: string; base_type?: string; }
export interface MetabaseResult { data: { cols: MetabaseCol[]; rows: any[][] }; }


@Injectable({
  providedIn: 'root'
})
export class MetabaseService {
  private metabaseUrl = 'http://localhost:3000';  // URL par défaut de Metabase
  private apiKey = ''; // API key si utilisée
  private databaseId = 2;

  /*runSqlDirect(sql: string): Observable<MetabaseResult> {
    console.log("query from runSqlDirect  : " + sql);
    const body = {
      database: this.databaseId,
      type: 'native',
      //native: { query: sql },
      native: { query: "SELECT * from users;" },
      parameters: []
    };

    // If you use API Key auth:
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Api-Key' : 'mb_SAYbUMEuu21KxTopM5x+/aDW2G+i86JwKl6PS/dBMFo=',
      'Access-Control-Allow-Origin' : '*'
    });

    return this.http.post<MetabaseResult>(`${this.metabaseUrl}/api/dataset`, body, { headers });
  }*/

  private currentDashboardSubject = new BehaviorSubject<MetabaseDashboard | null>(null);
  public currentDashboard$ = this.currentDashboardSubject.asObservable();

  private mockDashboards: MetabaseDashboard[] = [
    {
      id: 1,
      name: 'Tableau de Bord Principal',
      description: 'Tableau de bord principal avec toutes les métriques importantes',
      category: 'Principal',
      isActive: true,
      url: 'http://localhost:3000/public/dashboard/f84bd93e-4ced-4e8d-9f89-4103eabb7946',
      embedUrl: 'http://localhost:3000/public/dashboard/f84bd93e-4ced-4e8d-9f89-4103eabb7946'
    }
  ];

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey
    })
  };

  constructor(private http: HttpClient) { }

  configureMetabase(url: string, apiKey: string = ''): void {
    this.metabaseUrl = url;
    this.apiKey = apiKey;

    this.mockDashboards.forEach(dashboard => {
      dashboard.url = `${this.metabaseUrl}/dashboard/${dashboard.id}`;
      dashboard.embedUrl = `${dashboard.url}?embedded=true&theme=transparent`;
    });

    console.log('✅ Metabase configuré avec URL :', this.metabaseUrl);
  }

  getDashboards(): Observable<MetabaseDashboard[]> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.mockDashboards);
        observer.complete();
      }, 500);
    });
  }

  getAvailableDashboards(): Observable<MetabaseDashboard[]> {
    return this.getDashboards();
  }

  getDashboard(id: number): Observable<MetabaseDashboard | undefined> {
    return new Observable(observer => {
      setTimeout(() => {
        const dashboard = this.mockDashboards.find(d => d.id === id);
        observer.next(dashboard);
        observer.complete();
      }, 300);
    });
  }

  setCurrentDashboard(dashboard: MetabaseDashboard): void {
    this.currentDashboardSubject.next(dashboard);
  }

  getCurrentDashboard(): MetabaseDashboard | null {
    return this.currentDashboardSubject.value;
  }

  generateEmbedUrl(dashboardId: number, params?: any): string {
    let url = `${this.metabaseUrl}/embed/dashboard/${dashboardId}`;
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    return url;
  }

  // Vérifier la connectivité de Metabase
  checkConnectivity(): Observable<boolean> {
    return this.http.get(`${this.metabaseUrl}/api/health`).pipe(
      map((response: any) => response.status === 'ok'),
      catchError(() => {
        // Essayer l'URL publique du dashboard spécifique
        return this.http.get(`${this.metabaseUrl}/public/dashboard/f84bd93e-4ced-4e8d-9f89-4103eabb7946`, { responseType: 'text' }).pipe(
          map(() => true),
          catchError(() => {
            return [false];
          })
        );
      })
    );
  }

  // Obtenir une URL de démonstration si Metabase n'est pas disponible
  getDemoDashboardUrl(): string {
    // URL de démonstration publique de Metabase (si disponible)
    // Sinon, retourner une URL qui affiche un message informatif
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="text-align: center; max-width: 600px; padding: 2rem; background: rgba(255,255,255,0.1); border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">📊 Dashboard Metabase</h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
            Metabase n'est pas accessible sur <code style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.5rem; border-radius: 4px;">localhost:3000</code>
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
            <h3 style="margin-top: 0; color: #ffeb3b;">🔧 Pour activer le dashboard :</h3>
            <ol style="text-align: left; margin: 1rem 0;">
              <li>Installez et démarrez Metabase</li>
              <li>Configurez votre base de données</li>
              <li>Créez des tableaux de bord</li>
              <li>Publiez-les en accès public</li>
            </ol>
          </div>
          <div style="font-size: 0.9rem; opacity: 0.7;">
            <p>💡 Conseil : Utilisez les fonctionnalités d'export et de partage même sans Metabase actif</p>
          </div>
        </div>
      </div>
    `);
  }

  // ✅ Ajout de la méthode manquante
  getQuickMetrics(): Observable<any> {
    return this.http.get<any>(`${this.metabaseUrl}/api/quick-metrics`);
  }
}
