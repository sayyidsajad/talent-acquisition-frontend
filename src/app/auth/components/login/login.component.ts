import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn && this.authService.getRole() === 'Candidate') {
        this.router.navigate(['/job-feed']);
      } else {
        this.router.navigate(['/hr']);
      }
    });
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: [false],
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, role } = this.loginForm.value;
    const roleString = role ? 'HR' : 'Candidate';

    this.authService.login(email, roleString).subscribe({
      next: (response: { message: string }) => {
        this.loading = false;

        if (response?.message) {
          alert(`${response.message}`);
          this.loginForm.reset();
        } else {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'An error occurred. Please try again later.';
      },
    });
  }
}
