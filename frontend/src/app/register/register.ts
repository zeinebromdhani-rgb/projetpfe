import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, RegisterRequest } from '../services/api.service';
import { ValidationService } from '../services/validation.service';
import { emailTakenValidator } from './email-taken.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']  // ✅ Correction ici : styleUrl → styleUrls (avec un "s")
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;
  acceptTerms = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, ValidationService.nameValidator()]],
      email: ['', [Validators.required, ValidationService.emailValidator()] , [
        emailTakenValidator(this.apiService) // <-- async validator here
      ]],
      password: ['', [Validators.required, ValidationService.passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: ValidationService.passwordMatchValidator('password', 'confirmPassword')
    });

    // Mettre à jour la force du mot de passe en temps réel
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.calculatePasswordStrength(value);
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid && this.acceptTerms) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.validateRegistrationData()) {
        this.isLoading = false;
        return;
      }

      const registerRequest: RegisterRequest = {
        name: this.registerForm.value.name.trim(),
        email: this.registerForm.value.email.trim().toLowerCase(),
        password: this.registerForm.value.password
      };

      this.apiService.createUser({
        name: registerRequest.name,
        email: registerRequest.email,
        password: registerRequest.password
      }).subscribe({
        next: (user) => {
          console.log('Utilisateur créé:', user);
          this.successMessage = 'Inscription réussie ! Redirection vers la connexion...';
          localStorage.setItem('registeredEmail', registerRequest.email);

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Erreur lors de l\'inscription:', error);
          this.handleRegistrationError(error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  // Fonctions utilitaires

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      return ValidationService.getErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  private validateRegistrationData(): boolean {
    const { name, email, password } = this.registerForm.value;

    const scriptPattern = /<script|javascript:|data:/i;

    if ([name, email, password].some(val => scriptPattern.test(val))) {
      this.errorMessage = 'Caractères non autorisés détectés';
      return false;
    }

    if (this.passwordStrength < 50) {
      this.errorMessage = 'Le mot de passe n\'est pas assez fort';
      return false;
    }

    return true;
  }

  private handleRegistrationError(error: any): void {
    if (error.status === 409) {
      this.errorMessage = 'Cette adresse email est déjà utilisée';
    } else if (error.status === 400) {
      this.errorMessage = 'Données d\'inscription invalides';
    } else if (error.status === 429) {
      this.errorMessage = 'Trop de tentatives d\'inscription. Réessayez plus tard.';
    } else {
      this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
    }
  }

  private showValidationErrors(): void {
    const errors: string[] = [];

    Object.keys(this.registerForm.controls).forEach(key => {
      const error = this.getErrorMessage(key);
      if (error) {
        errors.push(error);
      }
    });

    if (!this.acceptTerms) {
      errors.push('Vous devez accepter les conditions d\'utilisation');
    }

    if (errors.length > 0) {
      this.errorMessage = errors[0]; // Afficher la première erreur
    }
  }

  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
    if (new Set(password).size >= 8) strength += 10;

    this.passwordStrength = Math.min(strength, 100);
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 30) return '#ff6b6b';
    if (this.passwordStrength < 60) return '#ffc107';
    if (this.passwordStrength < 80) return '#28a745';
    return '#007bff';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 30) return 'Faible';
    if (this.passwordStrength < 60) return 'Moyen';
    if (this.passwordStrength < 80) return 'Fort';
    return 'Très fort';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onEmailInput(): void {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.value) {
      const cleanedEmail = emailControl.value.trim().toLowerCase();
      if (cleanedEmail !== emailControl.value) {
        emailControl.setValue(cleanedEmail);
      }
    }
  }

  getFormStrength(): number {
    let validFields = 0;
    const totalFields = 4;

    Object.keys(this.registerForm.controls).forEach(key => {
      if (key !== 'acceptTerms' && this.registerForm.get(key)?.valid) {
        validFields++;
      }
    });

    let strength = (validFields / totalFields) * 100;

    if (this.acceptTerms) {
      strength = Math.min(strength + 10, 100);
    }

    return strength;
  }
}
