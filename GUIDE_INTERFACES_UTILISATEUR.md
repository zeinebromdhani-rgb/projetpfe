# 👥 Guide des Interfaces Utilisateur

## 🎯 Vue d'ensemble

Votre application dispose maintenant de **deux interfaces distinctes** selon le rôle de l'utilisateur :

1. **🔧 Interface Administrateur** - Gestion complète et configuration avancée
2. **📊 Interface Utilisateur** - Visualisation simple et épurée

---

## 🔐 **Comptes de test disponibles**

### **👑 Comptes Administrateur**
Ces comptes accèdent à l'interface d'administration complète :

- **Email :** `admin@monsite.com` | **Mot de passe :** `123456`
- **Email :** `administrateur@monsite.com` | **Mot de passe :** `password`
- **Email :** `admin@test.com` | **Mot de passe :** `admin123`

### **👤 Comptes Utilisateur Simple**
Ces comptes accèdent à l'interface utilisateur épurée :

- **Email :** `user@monsite.com` | **Mot de passe :** `123456`
- **Email :** `zeineb@monsite.com` | **Mot de passe :** `password`
- **Email :** `utilisateur@test.com` | **Mot de passe :** `user123`

---

## 🔧 **Interface Administrateur**

### **Accès :** `http://localhost:4201/admin-dashboard`

### **Fonctionnalités disponibles :**

#### **📊 Tableau de bord complet**
- Vue résumé avec toutes les métriques
- Vue dashboard avec tableaux de bord Metabase
- Navigation par onglets entre dashboards
- Métriques système et Metabase

#### **⚙️ Gestionnaire Metabase**
- Configuration URL Metabase
- Gestion des clés API
- Activation/désactivation des dashboards
- Monitoring de connexion en temps réel

#### **🎛️ Actions avancées**
- Actualisation manuelle des données
- Mode plein écran pour les dashboards
- Gestion des utilisateurs (à venir)
- Configuration système

#### **📈 Dashboards disponibles**
- Vue d'ensemble des ventes
- Analyse des utilisateurs
- Performance financière
- Analyse marketing
- Dashboards système (admin uniquement)

---

## 👤 **Interface Utilisateur Simple**

### **Accès :** `http://localhost:4201/user-dashboard`

### **Fonctionnalités disponibles :**

#### **📊 Vue d'ensemble**
- Métriques principales en temps réel
- Aperçu des tableaux de bord
- Informations utilisateur
- Interface épurée et intuitive

#### **📈 Tableaux de bord**
- Visualisation des dashboards autorisés
- Sélection simple par boutons
- Affichage plein écran automatique
- Pas de configuration avancée

#### **🎯 Dashboards autorisés**
- Vue d'ensemble des ventes
- Analyse des utilisateurs
- Performance financière
- Analyse marketing
- ❌ Pas d'accès aux dashboards système

#### **✨ Interface simplifiée**
- Navigation intuitive (Vue d'ensemble / Tableaux de bord)
- Actualisation automatique
- Design responsive
- Pas de gestion technique

---

## 🚀 **Comment tester les interfaces**

### **Test Interface Admin :**
1. Allez sur `http://localhost:4201/login`
2. Connectez-vous avec `admin@monsite.com` / `123456`
3. Vous serez redirigé vers `/admin-dashboard`
4. Explorez toutes les fonctionnalités avancées

### **Test Interface Utilisateur :**
1. Allez sur `http://localhost:4201/login`
2. Connectez-vous avec `user@monsite.com` / `123456`
3. Vous serez redirigé vers `/user-dashboard`
4. Explorez l'interface simplifiée

### **Test de redirection automatique :**
- Un admin qui va sur `/user-dashboard` est redirigé vers `/admin-dashboard`
- Un utilisateur qui va sur `/admin-dashboard` est redirigé vers `/user-dashboard`

---

## 🔄 **Système de rôles**

### **Détection automatique :**
Le système détecte automatiquement le rôle basé sur l'email :

- **Admin :** Emails contenant "admin" ou "administrateur"
- **Utilisateur :** Tous les autres emails

### **Permissions :**

#### **👑 Administrateur**
- `dashboard:manage` - Gérer les dashboards
- `dashboard:view` - Voir les dashboards
- `dashboard:configure` - Configurer Metabase
- `users:manage` - Gérer les utilisateurs
- `settings:modify` - Modifier les paramètres
- `metrics:view` - Voir les métriques
- `system:monitor` - Surveiller le système

#### **👤 Utilisateur**
- `dashboard:view` - Voir les dashboards
- `metrics:view` - Voir les métriques

---

## 🎨 **Différences visuelles**

### **Interface Admin**
- **Couleurs :** Gradient bleu-violet (`#7b7ffb` → `#8b50d5`)
- **Style :** Professionnel et technique
- **Navigation :** Complexe avec onglets et gestionnaire
- **Boutons :** Nombreuses actions disponibles

### **Interface Utilisateur**
- **Couleurs :** Gradient doux (`#667eea` → `#764ba2`)
- **Style :** Épuré et convivial
- **Navigation :** Simple (2 vues principales)
- **Boutons :** Actions essentielles uniquement

---

## 📱 **Responsive Design**

Les deux interfaces s'adaptent parfaitement à :
- **Desktop** - Affichage complet
- **Tablet** - Navigation adaptée
- **Mobile** - Interface simplifiée

---

## 🔧 **Configuration pour production**

### **Personnaliser les rôles :**
Modifiez `src/app/services/role.service.ts` :

```typescript
// Ajouter des utilisateurs prédéfinis
private demoUsers: UserWithRole[] = [
  {
    email: 'votre-admin@entreprise.com',
    role: UserRole.ADMIN
  }
];
```

### **Connecter à une vraie base de données :**
1. Modifiez les endpoints dans `api.service.ts`
2. Implémentez l'authentification réelle côté backend
3. Configurez les permissions en base

---

## 🎉 **Résumé**

✅ **Deux interfaces distinctes** selon le rôle
✅ **Redirection automatique** après connexion
✅ **Permissions granulaires** par rôle
✅ **Design adapté** à chaque type d'utilisateur
✅ **Sécurité** - Pas d'accès croisé
✅ **Responsive** sur tous les appareils

**Votre application offre maintenant une expérience utilisateur optimisée pour chaque type d'utilisateur !** 🚀
