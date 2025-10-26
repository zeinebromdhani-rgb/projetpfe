import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../login/login';

export interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  username: string;
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

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}

export interface UpdateRoleRequest {
  role: string; // e.g. "ADMIN" or "USER"
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


  // working 
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/register`, user, this.httpOptions);
  }

  // working 
  isEmailAlreadyUsed(email: string): Observable<boolean> {
    return this.http.get<boolean>(this.baseUrl + "/users/findByEmail/" + email, this.httpOptions);
  }

  // Authentification working 
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/users/authenticate`,
      loginRequest,
      this.httpOptions // likely contains headers like Content-Type: application/json
    );
  }

  getCurrentUser(): Observable<User> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.get<User>(
      `${this.baseUrl}/users/me`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // Gestion des utilisateurs
  getAllUsers(): Observable<User[]> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.get<User[]>(
      `${this.baseUrl}/users/getAll`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  loadSchema(): Observable<string> {
    const accessToken = localStorage.getItem('accessToken');
    return this.http.get(`${this.baseUrl}/schema/tables`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'text'
    });
  }


  updateUserProfile(userId: number, payload: UpdateProfileRequest): Observable<void> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.put<void>(
      `${this.baseUrl}/users/${userId}/profile`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }


  changeOwnPassword(payload: ChangePasswordRequest): Observable<void> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.put<void>(
      `${this.baseUrl}/users/me/password`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }


  updateUserRole(userId: number, payload: UpdateRoleRequest): Observable<void> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.put<void>(
      `${this.baseUrl}/users/${userId}/role`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  deleteUser(userId: number): Observable<void> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.delete<void>(
      `${this.baseUrl}/users/delete/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
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
