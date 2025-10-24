import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService, UserWithRole } from '../services/role.service';
import { ApiService, ChangePasswordRequest } from '../services/api.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';


@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  currentUser: UserWithRole | null = null;
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
    private roleService: RoleService,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = this.roleService.getUserInfo(user.email);
      this.profileForm.name = this.currentUser.name;
      this.profileForm.email = this.currentUser.email;

      // Load profile photo from server if available
      if (this.currentUser.profilePhoto) {
        // Load from server
        this.profilePhoto = `http://localhost:8080/${this.currentUser.profilePhoto}`;
      } else if (this.currentUser.id) {
        // Fallback to localStorage for backward compatibility
        this.profilePhoto = this.roleService.getProfilePhoto(this.currentUser.id);
      }
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form if canceling
      if (this.currentUser) {
        this.profileForm.name = this.currentUser.name;
        this.profileForm.email = this.currentUser.email;
        this.profileForm.currentPassword = '';
        this.profileForm.newPassword = '';
        this.profileForm.confirmPassword = '';
      }
    }
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      // Update user info using the role service's updateUser method
      const success = this.roleService.updateUser(this.currentUser!.id!, {
        name: this.profileForm.name,
        email: this.profileForm.email
      });

      if (success) {
        // Update local currentUser reference
        this.currentUser!.name = this.profileForm.name;
        this.currentUser!.email = this.profileForm.email;

        this.isEditing = false;
        alert('Profil mis à jour avec succès');
      } else {
        alert('Erreur lors de la mise à jour du profil');
      }

      this.isLoading = false;
    }, 1000);
  }

  changePassword(): void {
    if (this.profileForm.newPassword !== this.profileForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.profileForm.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!this.currentUser?.email) {
      alert('Erreur: utilisateur non identifié');
      return;
    }

    this.isLoading = true;

    const changePasswordRequest: ChangePasswordRequest = {
      currentPassword: this.profileForm.currentPassword,
      newPassword: this.profileForm.newPassword
    };

    this.apiService.changePassword(changePasswordRequest).subscribe({
      next: (response) => {
        alert('Mot de passe changé avec succès');
        this.profileForm.currentPassword = '';
        this.profileForm.newPassword = '';
        this.profileForm.confirmPassword = '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        let errorMessage = 'Erreur lors du changement de mot de passe';

        if (error.status === 400) {
          errorMessage = 'Mot de passe actuel incorrect ou nouveau mot de passe invalide';
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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhoto = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.currentUser?.id) return;

    this.isLoading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.apiService.uploadProfilePhoto(this.currentUser.id, formData).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the profile photo URL to load from server
          this.profilePhoto = `http://localhost:8080/${response.photoPath}`;
          // Update the currentUser object with the new photo path
          this.currentUser!.profilePhoto = response.photoPath;
          alert('Photo de profil mise à jour avec succès');
        } else {
          alert('Erreur lors de la mise à jour de la photo: ' + response.message);
        }
        this.isLoading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Erreur lors du téléchargement de la photo');
        this.isLoading = false;
      }
    });
  }

  removePhoto(): void {
    if (!this.currentUser?.id) return;

    this.isLoading = true;

    this.apiService.deleteProfilePhoto(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.profilePhoto = null;
          // Clear the profilePhoto field from currentUser
          this.currentUser!.profilePhoto = undefined;
          alert('Photo de profil supprimée avec succès');
        } else {
          alert('Erreur lors de la suppression: ' + response.message);
        }
        this.isLoading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Delete error:', error);
        alert('Erreur lors de la suppression de la photo');
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    const redirectRoute = this.roleService.getRedirectRoute();
    this.router.navigate([redirectRoute]);
  }

  logout(): void {
    this.authService.logout();
  }
}
