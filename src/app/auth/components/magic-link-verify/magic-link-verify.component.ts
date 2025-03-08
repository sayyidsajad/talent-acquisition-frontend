import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-magic-link-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magic-link-verify.component.html',
})
export class MagicLinkVerifyComponent {
  token: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.verifyToken(this.token);
    } else {
      this.errorMessage = 'Invalid token.';
    }
  }

  verifyToken(token: string): void {
    this.isLoading = true;
    this.authService.verifyMagicLink(token).subscribe({
      next: (response: { data: { jwtToken: string; role: string } }) => {
        this.isLoading = false;
        if (response.data.jwtToken) {
          localStorage.setItem('jwtToken', response.data.jwtToken);
          localStorage.setItem('role', response.data.role);

          this.authService.updateLoginState();

          this.successMessage = 'You have successfully logged in!';
          setTimeout(() => {
            if (response.data.role === 'Candidate') {
              this.router.navigate(['/job-feed']);
            } else {
              this.router.navigate(['/hr']);
            }
          }, 1500);
        } else {
          this.errorMessage = 'Invalid or expired token.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }
}
