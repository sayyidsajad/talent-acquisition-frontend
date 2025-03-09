import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('role');
    const currentPath = state.url;

    if (!token) {
      return this.handleUnauthenticatedUser(currentPath);
    }

    if (currentPath === '/' || currentPath === '') {
      this.redirectBasedOnRole(role);
      return false;
    }

    return this.handleAuthenticatedUser(route, role);
  }

  private handleUnauthenticatedUser(currentPath: string): boolean {
    if (currentPath.startsWith('/auth')) {
      return true;
    }
    this.router.navigate(['/auth']);
    return false;
  }

  private handleAuthenticatedUser(route: ActivatedRouteSnapshot, role: string | null): boolean {
    if (route.data['role'] && route.data['role'] !== role) {
      this.redirectBasedOnRole(role);
      return false;
    }
    return true;
  }

  private redirectBasedOnRole(role: string | null) {
    this.router.navigate([role === 'HR' ? '/hr' : '/job-feed']);
  }
}