import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config';

export interface SessionUser {
  id: number;
  email: string;
  name: string | null;
}

interface SessionResponse {
  token: string;
  user: SessionUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'mediflow_token';
  private userKey = 'mediflow_user';

  constructor(private http: HttpClient, private router: Router) {}

  // Envía el ID token de Google al backend para que lo verifique
  loginWithGoogle(credential: string): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${API_URL}/auth/google`, { credential })
      .pipe(tap(session => this.startSession(session)));
  }

  // Inicia sesión o registra la cuenta si el correo es nuevo
  loginWithEmail(email: string, password: string): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${API_URL}/auth/email`, { email, password })
      .pipe(tap(session => this.startSession(session)));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): SessionUser | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private startSession(session: SessionResponse): void {
    localStorage.setItem(this.tokenKey, session.token);
    localStorage.setItem(this.userKey, JSON.stringify(session.user));
    this.router.navigate(['/dashboard']);
  }
}
