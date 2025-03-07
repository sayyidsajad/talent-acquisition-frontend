import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(email: string, role: boolean): Observable<any> {
    return this.http.post(`${this.loginUrl}/auth/login`, { email, role });
  }
  verifyMagicLink(token: string): Observable<any> {
    return this.http.get(`${this.loginUrl}/auth/verify?token=${token}`);
  }
}
