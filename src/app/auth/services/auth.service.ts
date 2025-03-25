import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    window.addEventListener('storage', () => {
      this.isLoggedInSubject.next(this.hasToken());
    });
  }

  login(email: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, role });
  }

  verifyMagicLink(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify?token=${token}`);
  }

  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    this.isLoggedInSubject.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  updateLoginState() {
    this.isLoggedInSubject.next(this.hasToken());
    localStorage.setItem('loginUpdated', new Date().toISOString());
  }
}
