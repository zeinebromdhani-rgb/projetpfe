import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Test de connexion à la base de données
  testDatabase(): Observable<string> {
    return this.http.get(`${this.baseUrl}/test/db-test`, { responseType: 'text' });
  }

  // Gestion des utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/test/users`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/test/users`, user, this.httpOptions);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/admins`);
  }

  getOnlyUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/only-users`);
  }

  // Authentification
  login(loginRequest: LoginRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/login`, loginRequest, {
      ...this.httpOptions,
      responseType: 'text'
    });
  }

  // Inscription (à implémenter côté backend)
  register(registerRequest: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, registerRequest, this.httpOptions);
  }

  // Réinitialisation de mot de passe (à implémenter côté backend)
  resetPassword(email: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/reset-password`, { email }, {
      ...this.httpOptions,
      responseType: 'text'
    });
  }

  // Changement de mot de passe (à implémenter côté backend)
  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/change-password`, changePasswordRequest, {
      ...this.httpOptions,
      responseType: 'text'
    });
  }

  // Upload de photo de profil
  uploadProfilePhoto(userId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload/profile-photo/${userId}`, formData);
  }

  // Suppression de photo de profil
  deleteProfilePhoto(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/upload/profile-photo/${userId}`);
  }

  loadSchema(schema = 'public'): Observable<string> {
    return this.http.get(`${this.baseUrl}/schema/${schema}/tables`, { responseType: 'text' });
  }

  postToN8n(payload: { schema: string; nlq?: string }) {
    return this.http.post('http://localhost:5678/webhook-test/pfe/ask', payload, {
      headers: { 'Content-Type': 'application/json' }, 
    });
  }

  postToN8nText(schemaString: string) {
    return this.http.post('http://localhost:5678/webhook-test/pfe/ask', schemaString, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
