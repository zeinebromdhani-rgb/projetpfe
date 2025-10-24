import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { LandingComponent } from './landing/landing';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ResetPasswordComponent } from './reset-password/reset-password';
import { AuthGuard } from './services/auth.guard';
import { UserWelcomeComponent } from './user-welcome/user-welcome';
import { AdminWelcomeComponent } from './admin-welcome/admin-welcome';
import { UserProfile } from './user-profile/user-profile';
import { NaturalLanguageVisualization } from './natural-language-visualization/natural-language-visualization';




export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'user-welcome', component: UserWelcomeComponent },
  { path: 'admin-welcome', component: AdminWelcomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'user-profile', component: UserProfile },
  { path: 'visualization', component: NaturalLanguageVisualization, canActivate: [AuthGuard] },

];

