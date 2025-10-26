import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ValidationService } from '../services/validation.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resetAttempts = 0;
  maxResetAttempts = 3;
  isBlocked = false;
  blockTimeRemaining = 0;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [
        Validators.required,
        ValidationService.emailValidator()
      ]]
    });

    this.checkBlockStatus();
    this.prefillEmail();
  }

  onSubmit(): void {
    if (this.isBlocked) {
      this.errorMessage = `Trop de tentatives. Réessayez dans ${this.blockTimeRemaining} secondes.`;
      return;
    }

    if (this.resetForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const email = this.resetForm.value.email.trim().toLowerCase();

      if (!this.validateResetData(email)) {
        this.isLoading = false;
        return;
      }

      // add reset password endpoint
    } else {
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private markFormGroupTouched(): void {
    Object.values(this.resetForm.controls).forEach(control => control.markAsTouched());
  }

  getErrorMessage(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (field?.errors && field.touched) {
      return ValidationService.getErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  private checkBlockStatus(): void {
    const blockData = localStorage.getItem('resetBlock');
    if (blockData) {
      const { timestamp } = JSON.parse(blockData);
      const now = Date.now();
      const blockDuration = 10 * 60 * 1000; // 10 minutes

      if (now - timestamp < blockDuration) {
        this.isBlocked = true;
        this.blockTimeRemaining = Math.ceil((blockDuration - (now - timestamp)) / 1000);
        this.startBlockTimer();
      } else {
        localStorage.removeItem('resetBlock');
        this.resetAttempts = 0;
      }
    }
  }

  private startBlockTimer(): void {
    const timer = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        this.isBlocked = false;
        this.resetAttempts = 0;
        localStorage.removeItem('resetBlock');
        clearInterval(timer);
      }
    }, 1000);
  }

  private prefillEmail(): void {
    const email = localStorage.getItem('registeredEmail') || localStorage.getItem('resetEmail');
    if (email) {
      this.resetForm.patchValue({ email });
      localStorage.removeItem('registeredEmail');
    }
  }

  private validateResetData(email: string): boolean {
    if (email.length > 254) {
      this.errorMessage = 'Email trop long';
      return false;
    }

    if (/<script|javascript:|data:/i.test(email)) {
      this.errorMessage = 'Caractères non autorisés détectés';
      return false;
    }

    return true;
  }

  private handleResetError(error: any): void {
    this.resetAttempts++;

    if (this.resetAttempts >= this.maxResetAttempts) {
      this.blockUser();
      return;
    }

    const remainingAttempts = this.maxResetAttempts - this.resetAttempts;

    if (error.status === 404) {
      this.errorMessage = `Adresse email non trouvée. ${remainingAttempts} tentative(s) restante(s).`;
    } else if (error.status === 429) {
      this.errorMessage = 'Trop de demandes. Veuillez patienter.';
    } else {
      this.errorMessage = `Erreur. ${remainingAttempts} tentative(s) restante(s).`;
    }
  }

  private blockUser(): void {
    this.isBlocked = true;
    this.blockTimeRemaining = 10 * 60; // en secondes

    localStorage.setItem('resetBlock', JSON.stringify({
      timestamp: Date.now(),
      attempts: this.resetAttempts
    }));

    this.errorMessage = 'Trop de tentatives. Compte bloqué pendant 10 minutes.';
    this.startBlockTimer();
  }

  private resetResetAttempts(): void {
    this.resetAttempts = 0;
    this.isBlocked = false;
    localStorage.removeItem('resetBlock');
  }

  private showValidationErrors(): void {
    const error = this.getErrorMessage('email');
    this.errorMessage = error || 'Veuillez corriger les erreurs dans le formulaire';
  }

  onEmailInput(): void {
    const emailControl = this.resetForm.get('email');
    if (emailControl?.value) {
      const cleanedEmail = emailControl.value.trim().toLowerCase();
      if (cleanedEmail !== emailControl.value) {
        emailControl.setValue(cleanedEmail);
      }
    }
  }

  resendEmail(): void {
    if (!this.isBlocked && this.emailSent) {
      this.onSubmit();
    }
  }

  getFormStrength(): number {
    return this.resetForm.get('email')?.valid ? 100 : 0;
  }
}
