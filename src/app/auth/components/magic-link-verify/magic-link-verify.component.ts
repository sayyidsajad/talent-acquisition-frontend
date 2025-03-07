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
      next: (response: { jwtToken: string }) => {
        this.isLoading = false;
        console.log(response);
        
        if (response.jwtToken) {
          localStorage.setItem('jwtToken', response.jwtToken);
          this.successMessage = 'You have successfully logged in!';
          setTimeout(() => {
            this.router.navigate(['/job-feed']);
          }, 1500);
        } else {
          this.errorMessage = 'Invalid or expired token.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      },
    });
  }
}
