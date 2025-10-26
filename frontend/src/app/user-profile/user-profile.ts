import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService, User } from '../services/api.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';


@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  isLoading = false;
  profilePhoto: string | null = null;
  selectedFile: File | null = null;

  profileForm = {
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  currentDate = new Date();

  get currentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // load user from AuthService (which should have been hydrated on login)
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser) {
      this.profileForm.name = this.currentUser.name;
      this.profileForm.email = this.currentUser.email;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    // if we just left edit mode -> reset form fields
    if (!this.isEditing && this.currentUser) {
      this.profileForm.name = this.currentUser.name;
      this.profileForm.email = this.currentUser.email;
      this.selectedFile = null;
    }
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    const newName = this.profileForm.name.trim();
    const newEmail = this.profileForm.email.trim().toLowerCase();

    if (!newName || !newEmail) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    this.isLoading = true;

    this.apiService.updateUserProfile(this.currentUser.id!, {
      name: newName,
      email: newEmail
    }).subscribe({
      next: () => {
        // reflect change in local state so UI updates
        this.currentUser!.name = newName;
        this.currentUser!.email = newEmail;

        alert('Profil mis à jour avec succès.');
        this.isLoading = false;
        this.isEditing = false;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        alert('Erreur lors de la mise à jour du profil.');
        this.isLoading = false;
      }
    });
  }

  changePassword(): void {
    if (!this.currentUser) {
      alert('Erreur: utilisateur non identifié');
      return;
    }

    // front-side checks
    if (!this.profileForm.currentPassword) {
      alert('Veuillez saisir votre mot de passe actuel.');
      return;
    }

    if (this.profileForm.newPassword !== this.profileForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    if (this.profileForm.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    this.isLoading = true;

    this.apiService.changeOwnPassword({
      currentPassword: this.profileForm.currentPassword,
      newPassword: this.profileForm.newPassword
    }).subscribe({
      next: () => {
        alert('Mot de passe changé avec succès.');
        this.profileForm.currentPassword = '';
        this.profileForm.newPassword = '';
        this.profileForm.confirmPassword = '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du changement de mot de passe:', error);

        let errorMessage = 'Erreur lors du changement de mot de passe.';
        if (error.status === 400) {
          errorMessage = 'Mot de passe actuel incorrect.';
        } else if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }

        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhoto = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // optional quality-of-life hooks later
  // removePhoto(): void { ... }
  // uploadPhoto(): void { ... }

  goBack(): void {
    this.router.navigate(['/user-welcome']);
  }

  logout(): void {
    this.authService.logout();
  }
}


