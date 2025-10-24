import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, LoginRequest } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ValidationService } from '../services/validation.service';
import { UserWithRole } from '../models/user-with-role.model';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  loginAttempts = 0;
  maxLoginAttempts = 5;
  isBlocked = false;
  blockTimeRemaining = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        ValidationService.emailValidator()
      ]],
      password: ['']
    });

    this.checkBlockStatus();
  }

  onSubmit(): void {
    console.log('Login form submitted');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form value:', this.loginForm.value);

    if (this.isBlocked) {
      this.errorMessage = `Trop de tentatives échouées. Réessayez dans ${this.blockTimeRemaining} secondes.`;
      return;
    }

    const email = this.loginForm.value.email?.trim().toLowerCase();
    const password = this.loginForm.value.password;

    // Temporary admin access: allow login with admin@monsite.com without password
    const isAdminEmail = email === 'admin@monsite.com';
    const hasValidCredentials = (isAdminEmail && email) || (email && password);

    if (hasValidCredentials) {
      this.isLoading = true;
      this.errorMessage = '';

      console.log('Starting demo login...');

      setTimeout(() => {
        const loginRequest: LoginRequest = {
          email: email,
          password: password || 'temp_admin_password' // Temporary password for admin
        };

        const user = {
          name: this.extractNameFromEmail(loginRequest.email),
          email: loginRequest.email
        };

        console.log('Logging in user:', user);
        this.authService.login(user);
        this.resetLoginAttempts();
        this.isLoading = false;
        console.log('Login completed');
      }, 500);

      return;
    }

    // If form is not valid, show errors
    this.markFormGroupTouched();
    this.showValidationErrors();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      return ValidationService.getErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  private checkBlockStatus(): void {
    const blockData = localStorage.getItem('loginBlock');
    if (blockData) {
      const { timestamp } = JSON.parse(blockData);
      const now = Date.now();
      const blockDuration = 15 * 60 * 1000;

      if (now - timestamp < blockDuration) {
        this.isBlocked = true;
        this.blockTimeRemaining = Math.ceil((blockDuration - (now - timestamp)) / 1000);
        this.startBlockTimer();
      } else {
        localStorage.removeItem('loginBlock');
        this.loginAttempts = 0;
      }
    }
  }

  private startBlockTimer(): void {
    const timer = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        this.isBlocked = false;
        this.loginAttempts = 0;
        localStorage.removeItem('loginBlock');
        clearInterval(timer);
      }
    }, 1000);
  }

  private validateLoginData(loginRequest: LoginRequest): boolean {
    if (loginRequest.email.length > 254) {
      this.errorMessage = 'Email trop long';
      return false;
    }

    if (/<script|javascript:|data:/i.test(loginRequest.email) ||
        /<script|javascript:|data:/i.test(loginRequest.password)) {
      this.errorMessage = 'Caractères non autorisés détectés';
      return false;
    }

    return true;
  }

  private handleLoginError(): void {
    this.loginAttempts++;

    if (this.loginAttempts >= this.maxLoginAttempts) {
      this.isBlocked = true;
      this.blockTimeRemaining = 15 * 60;

      localStorage.setItem('loginBlock', JSON.stringify({
        timestamp: Date.now(),
        attempts: this.loginAttempts
      }));

      this.errorMessage = 'Trop de tentatives échouées. Compte bloqué pendant 15 minutes.';
      this.startBlockTimer();
    } else {
      const remainingAttempts = this.maxLoginAttempts - this.loginAttempts;
      this.errorMessage = `Email ou mot de passe incorrect. ${remainingAttempts} tentative(s) restante(s).`;
    }
  }

  private resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.isBlocked = false;
    localStorage.removeItem('loginBlock');
  }

  private showValidationErrors(): void {
    const emailErrors = this.getErrorMessage('email');
    const passwordErrors = this.getErrorMessage('password');

    if (emailErrors) {
      this.errorMessage = emailErrors;
    } else if (passwordErrors) {
      this.errorMessage = passwordErrors;
    } else {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onEmailInput(): void {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.value) {
      const cleanedEmail = emailControl.value.trim().toLowerCase();
      if (cleanedEmail !== emailControl.value) {
        emailControl.setValue(cleanedEmail);
      }
    }
  }

  getFormStrength(): number {
    let strength = 0;
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');

    if (emailControl?.valid) strength += 50;
    if (passwordControl?.valid) strength += 50;

    return strength;
  }

  private extractNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
