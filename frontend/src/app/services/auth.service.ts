import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedKey = 'mediflow_logged';
  private userKey = 'mediflow_user';

  constructor(private router: Router) {}

  loginWithGoogle(): void {
    const googleUser = {
      name: 'Usuario Google',
      email: 'usuario.google@gmail.com',
      avatar: 'G'
    };
    localStorage.setItem(this.isLoggedKey, 'true');
    localStorage.setItem(this.userKey, JSON.stringify(googleUser));
    this.router.navigate(['/appointments']);
  }

  loginWithEmail(email: string, pass: string): boolean {
    if (email && pass) {
      const customUser = {
        name: email.split('@')[0],
        email: email,
        avatar: email.charAt(0).toUpperCase()
      };
      localStorage.setItem(this.isLoggedKey, 'true');
      localStorage.setItem(this.userKey, JSON.stringify(customUser));
      this.router.navigate(['/appointments']);
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.isLoggedKey) === 'true';
  }

  logout(): void {
    localStorage.removeItem(this.isLoggedKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : { name: 'Invitado', email: '', avatar: 'I' };
  }
}