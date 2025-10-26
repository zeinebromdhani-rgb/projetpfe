import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, LoginRequest, User } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ValidationService } from '../services/validation.service';
import { TranslatePipe } from '../pipes/translate.pipe';


export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

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
    private authService : AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          ValidationService.emailValidator()
        ]
      ],
      password: [
        '',
        [
          Validators.required
        ]
      ]
    });


    this.checkBlockStatus();
  }

  onSubmit(): void {
    console.log('Login form submitted');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form value:', this.loginForm.value);

    // mark as touched so validation shows if user just clicked directly
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => {
        c.markAsTouched();
        c.updateValueAndValidity();
      });
      return;
    }

    if (this.isBlocked) {
      this.errorMessage = `Trop de tentatives échouées. Réessayez dans ${this.blockTimeRemaining} secondes.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const email = this.loginForm.value.email?.trim().toLowerCase();
    const password = this.loginForm.value.password;

    const loginRequest: LoginRequest = {
      username: email,     // <-- yes, backend expects username = email
      password: password
    };

    this.apiService.login(loginRequest).subscribe({
      next: (res: AuthResponse) => {
        // store tokens
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);

        // reset brute-force UI state
        this.loginAttempts = 0;
        this.isBlocked = false;
        this.blockTimeRemaining = 0;
        localStorage.removeItem('loginBlock');

        // fetch current user from /users/me
        this.apiService.getCurrentUser().subscribe({
          next: (me: User) => {
            // hydrate global auth and navigate
            this.authService.setAuthenticatedUserFromBackend(me);

            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load /users/me:', err);
            this.isLoading = false;
            this.errorMessage = 'Impossible de récupérer le profil utilisateur.';
          }
        });
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.isLoading = false;

        this.loginAttempts++;
        if (this.loginAttempts >= this.maxLoginAttempts) {
          this.blockUserTemporarily();
        }

        if (err.status === 403 || err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });


  }
  private blockUserTemporarily(): void {
    this.isBlocked = true;
    this.loginAttempts = this.maxLoginAttempts;

    const timestamp = Date.now();
    localStorage.setItem('loginBlock', JSON.stringify({ timestamp }));

    const blockDuration = 15 * 60 * 1000; // 15 minutes
    this.blockTimeRemaining = Math.ceil(blockDuration / 1000);

    this.startBlockTimer();
  }

  decodeJwt(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch (e) {
      console.error('Invalid JWT', e);
      return null;
    }
  }


  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control) return '';

    if (control.touched || control.dirty) {
      // email field errors
      if (controlName === 'email') {
        if (control.errors?.['required']) {
          return 'L’adresse e-mail est obligatoire.';
        }
        if (control.errors?.['invalidEmail']) {
          return 'Format d’e-mail invalide.';
        }
      }

      // password field errors
      if (controlName === 'password') {
        if (control.errors?.['required']) {
          return 'Le mot de passe est obligatoire.';
        }
        // (optional) if you add minLength in the validator
        if (control.errors?.['minlength']) {
          return `Le mot de passe doit contenir au moins ${control.errors['minlength'].requiredLength} caractères.`;
        }
      }
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
}
