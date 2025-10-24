import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  // Validation d'email avancée
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Laisse le required s'occuper de ça
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(control.value);

      if (!isValid) {
        return { invalidEmail: true };
      }

      // Vérifications supplémentaires
      const email = control.value.toLowerCase();
      
      // Domaines interdits
      const forbiddenDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
      const domain = email.split('@')[1];
      
      if (forbiddenDomains.includes(domain)) {
        return { forbiddenDomain: true };
      }

      // Email trop long
      if (email.length > 254) {
        return { emailTooLong: true };
      }

      return null;
    };
  }

  // Validation de mot de passe robuste
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      // Longueur minimum
      if (password.length < 8) {
        errors['minLength'] = { requiredLength: 8, actualLength: password.length };
      }

      // Longueur maximum
      if (password.length > 128) {
        errors['maxLength'] = { requiredLength: 128, actualLength: password.length };
      }

      // Au moins une minuscule
      if (!/[a-z]/.test(password)) {
        errors['requiresLowercase'] = true;
      }

      // Au moins une majuscule
      if (!/[A-Z]/.test(password)) {
        errors['requiresUppercase'] = true;
      }

      // Au moins un chiffre
      if (!/\d/.test(password)) {
        errors['requiresDigit'] = true;
      }

      // Au moins un caractère spécial
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors['requiresSpecialChar'] = true;
      }

      // Pas d'espaces
      if (/\s/.test(password)) {
        errors['noSpaces'] = true;
      }

      // Mots de passe communs interdits
      const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123', 
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
      ];
      
      if (commonPasswords.includes(password.toLowerCase())) {
        errors['commonPassword'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Validation de nom complet
  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const name = control.value.trim();
      const errors: ValidationErrors = {};

      // Longueur minimum
      if (name.length < 2) {
        errors['minLength'] = { requiredLength: 2, actualLength: name.length };
      }

      // Longueur maximum
      if (name.length > 50) {
        errors['maxLength'] = { requiredLength: 50, actualLength: name.length };
      }

      // Seulement lettres, espaces, tirets et apostrophes
      if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(name)) {
        errors['invalidCharacters'] = true;
      }

      // Pas de chiffres
      if (/\d/.test(name)) {
        errors['noNumbers'] = true;
      }

      // Pas de caractères spéciaux (sauf - et ')
      if (/[!@#$%^&*()_+=\[\]{};:"\\|,.<>\/?]/.test(name)) {
        errors['noSpecialChars'] = true;
      }

      // Au moins une lettre
      if (!/[a-zA-ZÀ-ÿ]/.test(name)) {
        errors['requiresLetter'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Validation de confirmation de mot de passe
  static passwordMatchValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordField);
      const confirmPassword = control.parent.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  // Validation d'URL
  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        const url = new URL(control.value);
        
        // Protocoles autorisés
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { invalidProtocol: true };
        }

        // Pas de localhost en production (optionnel)
        // if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        //   return { localhostNotAllowed: true };
        // }

        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  // Validation de numéro de téléphone
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phone = control.value.replace(/\s/g, '');
      
      // Format français
      const frenchPhoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
      
      if (!frenchPhoneRegex.test(phone)) {
        return { invalidPhone: true };
      }

      return null;
    };
  }

  // Messages d'erreur personnalisés
  static getErrorMessage(fieldName: string, errors: ValidationErrors): string {
    const fieldDisplayName = this.getFieldDisplayName(fieldName);

    if (errors['required']) {
      return `${fieldDisplayName} est requis`;
    }

    if (errors['invalidEmail']) {
      return 'Format d\'email invalide';
    }

    if (errors['forbiddenDomain']) {
      return 'Ce domaine email n\'est pas autorisé';
    }

    if (errors['emailTooLong']) {
      return 'L\'email est trop long (maximum 254 caractères)';
    }

    if (errors['minLength']) {
      const requiredLength = errors['minLength'].requiredLength;
      return `${fieldDisplayName} doit contenir au moins ${requiredLength} caractères`;
    }

    if (errors['maxLength']) {
      const requiredLength = errors['maxLength'].requiredLength;
      return `${fieldDisplayName} ne peut pas dépasser ${requiredLength} caractères`;
    }

    if (errors['requiresLowercase']) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }

    if (errors['requiresUppercase']) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }

    if (errors['requiresDigit']) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }

    if (errors['requiresSpecialChar']) {
      return 'Le mot de passe doit contenir au moins un caractère spécial';
    }

    if (errors['noSpaces']) {
      return 'Le mot de passe ne peut pas contenir d\'espaces';
    }

    if (errors['commonPassword']) {
      return 'Ce mot de passe est trop commun, choisissez-en un autre';
    }

    if (errors['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }

    if (errors['invalidCharacters']) {
      return 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes';
    }

    if (errors['noNumbers']) {
      return 'Le nom ne peut pas contenir de chiffres';
    }

    if (errors['noSpecialChars']) {
      return 'Le nom ne peut pas contenir de caractères spéciaux';
    }

    if (errors['requiresLetter']) {
      return 'Le nom doit contenir au moins une lettre';
    }

    if (errors['invalidUrl']) {
      return 'URL invalide';
    }

    if (errors['invalidProtocol']) {
      return 'L\'URL doit commencer par http:// ou https://';
    }

    if (errors['invalidPhone']) {
      return 'Numéro de téléphone invalide';
    }

    return 'Champ invalide';
  }

  private static getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'name': 'Le nom',
      'firstName': 'Le prénom',
      'lastName': 'Le nom de famille',
      'email': 'L\'email',
      'password': 'Le mot de passe',
      'confirmPassword': 'La confirmation du mot de passe',
      'phone': 'Le numéro de téléphone',
      'url': 'L\'URL',
      'metabaseUrl': 'L\'URL Metabase',
      'apiKey': 'La clé API'
    };
    return displayNames[fieldName] || 'Le champ';
  }

  // Validation en temps réel
  static validateField(value: any, validators: ValidatorFn[]): string[] {
    const errors: string[] = [];
    
    for (const validator of validators) {
      const control = { value } as AbstractControl;
      const result = validator(control);
      
      if (result) {
        Object.keys(result).forEach(key => {
          errors.push(this.getErrorMessage('field', { [key]: result[key] }));
        });
      }
    }
    
    return errors;
  }
}
