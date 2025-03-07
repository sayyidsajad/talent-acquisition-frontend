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
  isHr = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: [false],
    });
  }

  toggleRole() {
    this.isHr = !this.isHr;
  }

  login() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, role } = this.loginForm.value;

    this.authService.login(email, role).subscribe({
      next: (response: { success: any }) => {
        this.loading = false;
        if (response && response.success) {
          alert(`Login successful as ${role ? 'HR' : 'Candidate'}`);
        } else {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'An error occurred. Please try again later.';
      },
    });
  }
}
