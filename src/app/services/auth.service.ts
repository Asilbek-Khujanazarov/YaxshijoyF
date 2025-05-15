import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backendUrl = 'http://localhost:5233'; // Backend URL’ingiz

  constructor(private http: HttpClient) {}

  loginWithGoogle(): void {
    console.log('Google autentifikatsiyasi boshlanmoqda...');
    window.location.href = `${this.backendUrl}/api/auth/login`;
  }

  getCurrentUser() {
    return this.http.get(`${this.backendUrl}/api/auth/me`, { withCredentials: true });
  }

  logout() {
    return this.http.post(`${this.backendUrl}/api/auth/logout`, {}, { withCredentials: true });
  }
}