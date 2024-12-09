import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-content">
          <div class="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your account</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter your email"
              >
              <div 
                *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                class="error-message"
              >
                Please enter a valid email
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Enter your password"
              >
              <div 
                *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                class="error-message"
              >
                Password is required
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                (click)="forgotPassword()"
                class="forgot-password"
              >
                Forgot Password?
              </button>
              <button 
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="submit-button"
              >
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </button>
            </div>
          </form>

          <div class="divider">
            <span>or</span>
          </div>

          <div class="social-auth">
            <button 
              (click)="loginWithGoogle()"
              [disabled]="isLoading"
              class="social-button google-button"
            >
              <img src="assets/icons/google.svg" alt="Google" class="social-icon">
              <span>Continue with Google</span>
            </button>
            <button 
              (click)="loginWithApple()"
              [disabled]="isLoading"
              class="social-button apple-button"
            >
              <img src="assets/icons/apple.svg" alt="Apple" class="social-icon">
              <span>Continue with Apple</span>
            </button>
          </div>

          <div class="auth-footer">
            <p>
              Don't have an account?
              <a routerLink="/auth/register">Register</a>
            </p>
          </div>

          <div *ngIf="error" class="error-alert">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .auth-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-content {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      padding: 2.5rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      font-size: 2rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: #718096;
    }

    .auth-form {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #4a5568;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #4299e1;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
    }

    .forgot-password {
      background: none;
      border: none;
      color: #4299e1;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }

    .submit-button {
      padding: 0.75rem 1.5rem;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .submit-button:hover:not(:disabled) {
      background: #3182ce;
    }

    .submit-button:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 45%;
      height: 1px;
      background: #e2e8f0;
    }

    .divider::before {
      left: 0;
    }

    .divider::after {
      right: 0;
    }

    .divider span {
      background: white;
      padding: 0 1rem;
      color: #718096;
      font-size: 0.875rem;
    }

    .social-auth {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .social-button {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #2d3748;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.2s;
    }

    .social-button:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }

    .social-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .social-icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    .google-button {
      color: #4285f4;
      border-color: #4285f4;
    }

    .google-button:hover {
      background: #f8faff;
    }

    .apple-button {
      color: #000;
      border-color: #000;
    }

    .apple-button:hover {
      background: #f8f8f8;
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      color: #718096;
    }

    .auth-footer a {
      color: #4299e1;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-alert {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fff5f5;
      color: #c53030;
      border-radius: 8px;
      text-align: center;
      font-size: 0.875rem;
    }

    @media (max-width: 640px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-content {
        padding: 1.5rem;
      }

      .auth-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.error = null;

      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    }
  }

  loginWithGoogle(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.error = null;

      this.authService.loginWithGoogle().subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    }
  }

  loginWithApple(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.error = null;

      this.authService.loginWithApple().subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    }
  }

  forgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.isLoading = true;
      this.error = null;

      this.authService.resetPassword(email).subscribe({
        next: () => {
          alert('Password reset email sent. Please check your inbox.');
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'Please enter your email address to reset password';
    }
  }
}