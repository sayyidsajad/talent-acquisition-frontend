import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('jwtToken');
    const currentPath = route.routeConfig?.path;
    if (!token) {
      if (currentPath === 'auth' || currentPath === 'auth/verify') {
        return true;
      } else {
        this.router.navigate(['/auth']);
        return false;
      }
    }
    if (currentPath === 'auth' || currentPath === 'auth/verify') {
      this.router.navigate(['/job-feed']);
      return false;
    }
    return true;
  }
}
