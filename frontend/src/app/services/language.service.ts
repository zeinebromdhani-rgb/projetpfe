import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'fr' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>('fr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Translations = {
    fr: {
      // Navigation
      'nav.dashboard': 'Tableau de bord',
      'nav.users': 'Utilisateurs',
      'nav.profile': 'Profil',
      'nav.notifications': 'Notifications',
      'nav.reports': 'Rapports',
      'nav.logout': 'Déconnexion',

      // Common
      'common.save': 'Sauvegarder',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.add': 'Ajouter',
      'common.export': 'Exporter',
      'common.send': 'Envoyer',
      'common.loading': 'Chargement...',
      'common.success': 'Succès',
      'common.error': 'Erreur',
      'common.back': 'Retour',

      // Authentication
      'auth.login': 'Se connecter',
      'auth.register': 'S\'inscrire',
      'auth.logout': 'Se déconnecter',
      'auth.user_access': 'Accès Utilisateur',
      'auth.login_prompt': 'Connectez-vous pour accéder à votre espace personnel',

      // Dashboard
      'dashboard.title': 'Tableau de Bord',
      'dashboard.welcome': 'Bienvenue',
      'dashboard.welcome_desc': 'Bienvenue sur votre espace personnel',
      'dashboard.stats': 'Statistiques',
      'dashboard.actions': 'Actions rapides',
      'dashboard.recent_activity': 'Activité récente',

      // Stats
      'stats.dashboards': 'Tableaux de bord',
      'stats.last_login': 'Dernière connexion',
      'stats.account_status': 'Statut du compte',

      // Actions
      'actions.quick_access': 'Accès rapide',
      'actions.my_dashboards': 'Mes tableaux de bord',
      'actions.my_dashboards_desc': 'Visualisez vos données et analyses',
      'actions.my_profile': 'Mon profil',
      'actions.my_profile_desc': 'Gérez vos informations personnelles',
      'actions.notifications': 'Notifications',
      'actions.notifications_desc': 'Consultez vos messages',
      'actions.reports': 'Rapports',
      'actions.reports_desc': 'Téléchargez vos rapports',
      'actions.ai_assistant': 'Assistant IA',
      'actions.ai_assistant_desc': 'Créez des visualisations intelligentes',

      // Activity
      'activity.dashboard_view': 'Consultation du tableau de bord Ventes',
      'activity.report_generated': 'Nouveau rapport généré',
      'activity.data_updated': 'Données mises à jour',
      'activity.hours_ago': 'Il y a 2 heures',
      'activity.yesterday': 'Hier à 14:30',
      'activity.days_ago': 'Il y a 3 jours',

      // User management
      'users.title': 'Gestion des Utilisateurs',
      'users.name': 'Nom',
      'users.email': 'Email',
      'users.role': 'Rôle',
      'users.created': 'Créé le',
      'users.lastLogin': 'Dernière connexion',
      'users.actions': 'Actions',

      // Settings
      'settings.theme': 'Thème',
      'settings.language': 'Langue',
      'settings.light': 'Clair',
      'settings.dark': 'Sombre',
      'settings.french': 'Français',
      'settings.english': 'English',

      // Login
      'login.title': 'Connexion',
      'login.email': 'Email',
      'login.password': 'Mot de passe',
      'login.email_placeholder': 'exemple@domaine.com',
      'login.password_placeholder': 'Entrez votre mot de passe',
      'login.forgot_password': 'Mot de passe oublié ?',
      'login.no_account': 'Pas encore de compte ?',
      'login.connecting': 'Connexion en cours...',
      'login.blocked': 'Compte bloqué',
      'login.email_valid': 'Email valide',
      'login.password_valid': 'Mot de passe valide',
      'login.attempts_used': 'tentatives utilisées',
      'login.account_blocked': 'Compte temporairement bloqué',
      'login.seconds_remaining': 'secondes restantes',
      'login.form_incomplete': 'Formulaire incomplet',
      'login.form_progress': 'Formulaire en cours',
      'login.form_ready': 'Formulaire prêt',
      'login.show_password': 'Afficher le mot de passe',
      'login.hide_password': 'Masquer le mot de passe',

      // User Profile
      'profile.title': 'Mon Profil',
      'profile.manage_info': 'Gérez vos informations personnelles',
      'profile.edit': 'Modifier',
      'profile.save': 'Sauvegarder',
      'profile.cancel': 'Annuler',
      'profile.personal_info': 'Informations Personnelles',
      'profile.change_password': 'Changer le Mot de Passe',
      'profile.current_password': 'Mot de passe actuel',
      'profile.new_password': 'Nouveau mot de passe',
      'profile.confirm_password': 'Confirmer le mot de passe',
      'profile.name': 'Nom complet',
      'profile.email': 'Email',
      'profile.role': 'Rôle',
      'profile.last_login': 'Dernière connexion',
      'profile.admin': 'Administrateur',
      'profile.user': 'Utilisateur',
      'profile.upload_photo': 'Télécharger la photo',
      'profile.remove_photo': 'Supprimer la photo',
      'profile.change_photo': 'Changer',
      'profile.saving': 'Sauvegarde...',
      'profile.uploading': 'Téléchargement...',
      'profile.preferences': 'Préférences',
      'profile.notifications': 'Notifications',
      'profile.email_notifications': 'Notifications par email',
      'profile.dashboard_updates': 'Mises à jour du tableau de bord',
      'profile.security_alerts': 'Alertes de sécurité',
      'profile.language': 'Langue',
      'profile.theme': 'Thème',
      'profile.light_theme': 'Clair',
      'profile.dark_theme': 'Sombre',
      'profile.french_lang': 'Français',
      'profile.english_lang': 'English',
      'profile.save_preferences': 'Sauvegarder les préférences'
    },
    en: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.users': 'Users',
      'nav.profile': 'Profile',
      'nav.notifications': 'Notifications',
      'nav.reports': 'Reports',
      'nav.logout': 'Logout',

      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.export': 'Export',
      'common.send': 'Send',
      'common.loading': 'Loading...',
      'common.success': 'Success',
      'common.error': 'Error',
      'common.back': 'Back',

      // Authentication
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.user_access': 'User Access',
      'auth.login_prompt': 'Please log in to access your personal space',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome',
      'dashboard.welcome_desc': 'Welcome to your personal space',
      'dashboard.stats': 'Statistics',
      'dashboard.actions': 'Quick Actions',
      'dashboard.recent_activity': 'Recent Activity',

      // Stats
      'stats.dashboards': 'Dashboards',
      'stats.last_login': 'Last Login',
      'stats.account_status': 'Account Status',

      // Actions
      'actions.quick_access': 'Quick Access',
      'actions.my_dashboards': 'My Dashboards',
      'actions.my_dashboards_desc': 'View your data and analytics',
      'actions.my_profile': 'My Profile',
      'actions.my_profile_desc': 'Manage your personal information',
      'actions.notifications': 'Notifications',
      'actions.notifications_desc': 'Check your messages',
      'actions.reports': 'Reports',
      'actions.reports_desc': 'Download your reports',
      'actions.ai_assistant': 'AI Assistant',
      'actions.ai_assistant_desc': 'Create intelligent visualizations',

      // Activity
      'activity.dashboard_view': 'Sales Dashboard View',
      'activity.report_generated': 'New Report Generated',
      'activity.data_updated': 'Data Updated',
      'activity.hours_ago': '2 hours ago',
      'activity.yesterday': 'Yesterday at 2:30 PM',
      'activity.days_ago': '3 days ago',

      // User management
      'users.title': 'User Management',
      'users.name': 'Name',
      'users.email': 'Email',
      'users.role': 'Role',
      'users.created': 'Created',
      'users.lastLogin': 'Last Login',
      'users.actions': 'Actions',

      // Settings
      'settings.theme': 'Theme',
      'settings.language': 'Language',
      'settings.light': 'Light',
      'settings.dark': 'Dark',
      'settings.french': 'French',
      'settings.english': 'English',

      // Login
      'login.title': 'Login',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.email_placeholder': 'example@domain.com',
      'login.password_placeholder': 'Enter your password',
      'login.forgot_password': 'Forgot password?',
      'login.no_account': 'Don\'t have an account yet?',
      'login.connecting': 'Connecting...',
      'login.blocked': 'Account blocked',
      'login.email_valid': 'Valid email',
      'login.password_valid': 'Valid password',
      'login.attempts_used': 'attempts used',
      'login.account_blocked': 'Account temporarily blocked',
      'login.seconds_remaining': 'seconds remaining',
      'login.form_incomplete': 'Form incomplete',
      'login.form_progress': 'Form in progress',
      'login.form_ready': 'Form ready',
      'login.show_password': 'Show password',
      'login.hide_password': 'Hide password',

      // User Profile
      'profile.title': 'My Profile',
      'profile.manage_info': 'Manage your personal information',
      'profile.edit': 'Edit',
      'profile.save': 'Save',
      'profile.cancel': 'Cancel',
      'profile.personal_info': 'Personal Information',
      'profile.change_password': 'Change Password',
      'profile.current_password': 'Current password',
      'profile.new_password': 'New password',
      'profile.confirm_password': 'Confirm password',
      'profile.name': 'Full name',
      'profile.email': 'Email',
      'profile.role': 'Role',
      'profile.last_login': 'Last login',
      'profile.admin': 'Administrator',
      'profile.user': 'User',
      'profile.upload_photo': 'Upload photo',
      'profile.remove_photo': 'Remove photo',
      'profile.change_photo': 'Change',
      'profile.saving': 'Saving...',
      'profile.uploading': 'Uploading...',
      'profile.preferences': 'Preferences',
      'profile.notifications': 'Notifications',
      'profile.email_notifications': 'Email notifications',
      'profile.dashboard_updates': 'Dashboard updates',
      'profile.security_alerts': 'Security alerts',
      'profile.language': 'Language',
      'profile.theme': 'Theme',
      'profile.light_theme': 'Light',
      'profile.dark_theme': 'Dark',
      'profile.french_lang': 'French',
      'profile.english_lang': 'English',
      'profile.save_preferences': 'Save preferences'
    }
  };

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      this.setLanguage(savedLanguage);
    } else {
      // Default to English
      this.setLanguage('en');
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('app-language', language);
    // Update document language
    document.documentElement.lang = language;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang]?.[key] || this.translations['fr'][key] || key;
  }

  getAvailableLanguages(): { code: Language; name: string }[] {
    return [
      { code: 'fr', name: 'Français' },
      { code: 'en', name: 'English' }
    ];
  }
}