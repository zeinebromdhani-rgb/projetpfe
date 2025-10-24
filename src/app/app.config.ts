// Importation de la configuration principale Angular
import { ApplicationConfig, provideZoneChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';

// Importation du système de routing
import { provideRouter } from '@angular/router';

// Importation du client HTTP
import { provideHttpClient } from '@angular/common/http';

// Importation de tes routes personnalisées
import { routes } from './app.routes';

// Configuration de l'application
export const appConfig: ApplicationConfig = {
  providers: [
    // Pour gérer les erreurs globales dans le navigateur
    provideBrowserGlobalErrorListeners(),

    // Pour mieux détecter les changements dans la zone Angular
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Activation du routing avec les routes définies
    provideRouter(routes),

    // Activation du client HTTP pour les appels API
    provideHttpClient()
  ]
};
