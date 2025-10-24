# 📊 Guide d'intégration Metabase

## Vue d'ensemble

Votre application dispose maintenant d'une intégration complète avec Metabase, permettant d'afficher des tableaux de bord interactifs directement dans l'interface utilisateur.

## 🎯 Fonctionnalités disponibles

### 1. **Tableau de bord principal**
- **Vue résumé** : Métriques rapides et aperçu des dashboards
- **Vue dashboard** : Affichage complet des tableaux de bord Metabase
- **Navigation par onglets** : Basculer entre différents dashboards

### 2. **Gestionnaire de dashboards**
- Configuration de l'URL Metabase
- Gestion des clés API
- Activation/désactivation des dashboards
- Monitoring de la connexion

### 3. **Intégration en temps réel**
- Métriques actualisées automatiquement
- Dashboards interactifs
- Mode plein écran
- Actualisation manuelle

## 🚀 Comment utiliser l'interface

### Étape 1 : Connexion
1. Allez sur `http://localhost:4201/login`
2. Connectez-vous avec vos identifiants
3. Vous serez redirigé vers le tableau de bord

### Étape 2 : Configuration Metabase
1. Cliquez sur le bouton **"⚙️ Gérer"** dans l'en-tête
2. Configurez l'URL de votre instance Metabase (par défaut : `http://localhost:3000`)
3. Ajoutez votre clé API Metabase (optionnel)
4. Sauvegardez la configuration

### Étape 3 : Utilisation des dashboards
1. **Vue résumé** : Voir les métriques principales et les aperçus
2. **Vue dashboard** : Cliquer sur "📊 Vue dashboard" pour voir les tableaux complets
3. **Navigation** : Utiliser les onglets pour basculer entre dashboards
4. **Plein écran** : Cliquer sur l'icône plein écran dans chaque dashboard

## 🔧 Configuration technique

### URLs importantes
- **Frontend** : `http://localhost:4201`
- **Backend** : `http://localhost:8080`
- **Metabase** : `http://localhost:3000` (par défaut)

### Dashboards simulés disponibles
1. **Vue d'ensemble des ventes** - Métriques de vente principales
2. **Analyse des utilisateurs** - Comportement et statistiques utilisateurs
3. **Performance financière** - Indicateurs financiers et revenus
4. **Analyse marketing** - Campagnes et conversion

### Métriques en temps réel
- **Revenus totaux** : 125,000€
- **Utilisateurs totaux** : 1,250
- **Taux de conversion** : 3.2%
- **Utilisateurs actifs** : 89

## 🔗 Intégration avec une vraie instance Metabase

### Prérequis
1. Instance Metabase fonctionnelle
2. Dashboards créés dans Metabase
3. Clé API Metabase (optionnel)

### Configuration
1. **URL Metabase** : Remplacez `http://localhost:3000` par votre URL
2. **Clé API** : Générez une clé API dans Metabase > Admin > API Keys
3. **IDs des dashboards** : Modifiez les IDs dans `metabase.service.ts`

### Exemple de configuration
```typescript
// Dans metabase.service.ts
private metabaseUrl = 'https://votre-metabase.com';
private apiKey = 'votre-cle-api';

// Dashboards réels
private realDashboards: MetabaseDashboard[] = [
  {
    id: 1, // ID réel de votre dashboard Metabase
    name: 'Dashboard Ventes',
    url: 'https://votre-metabase.com/dashboard/1'
  }
];
```

## 🎨 Personnalisation

### Thèmes et couleurs
- Modifiez les couleurs dans les fichiers CSS
- Gradient principal : `#7b7ffb` vers `#8b50d5`
- Couleur Metabase : `#00d4aa`

### Ajout de nouveaux dashboards
1. Modifiez `mockDashboards` dans `metabase.service.ts`
2. Ajoutez les nouveaux dashboards avec leurs IDs
3. Configurez les URLs d'embed appropriées

### Métriques personnalisées
1. Modifiez `getQuickMetrics()` dans `metabase.service.ts`
2. Ajoutez vos propres appels API
3. Mettez à jour l'affichage dans `accueil.component.html`

## 🔒 Sécurité

### Bonnes pratiques
- Utilisez HTTPS en production
- Configurez les CORS appropriés
- Protégez vos clés API
- Utilisez l'authentification JWT

### Configuration CORS Metabase
```bash
# Variables d'environnement Metabase
MB_EMBEDDING_SECRET_KEY=votre-secret-key
MB_ENABLE_EMBEDDING=true
MB_SITE_URL=https://votre-domaine.com
```

## 📱 Responsive Design

L'interface est entièrement responsive et s'adapte à :
- **Desktop** : Affichage complet avec tous les éléments
- **Tablet** : Navigation adaptée et grilles ajustées
- **Mobile** : Interface simplifiée et navigation verticale

## 🐛 Dépannage

### Problèmes courants

1. **Dashboard ne s'affiche pas**
   - Vérifiez l'URL Metabase
   - Contrôlez la configuration CORS
   - Vérifiez les IDs des dashboards

2. **Erreur de connexion**
   - Vérifiez que Metabase est accessible
   - Contrôlez la clé API
   - Vérifiez les logs du navigateur

3. **Métriques non mises à jour**
   - Cliquez sur "🔄 Actualiser"
   - Vérifiez la connexion réseau
   - Contrôlez les appels API

### Logs utiles
```javascript
// Dans la console du navigateur
console.log('Dashboards chargés:', this.availableDashboards);
console.log('Métriques:', this.quickMetrics);
console.log('Dashboard sélectionné:', this.selectedDashboard);
```

## 🚀 Prochaines étapes

1. **Connecter une vraie instance Metabase**
2. **Configurer l'authentification SSO**
3. **Ajouter plus de dashboards**
4. **Implémenter des alertes en temps réel**
5. **Ajouter des exports PDF/Excel**

---

**🎉 Félicitations !** Votre interface Metabase est maintenant prête à l'emploi !
