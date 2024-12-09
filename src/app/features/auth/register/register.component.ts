import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-content">
          <div class="auth-header">
            <h1>Create Account</h1>
            <p>Join us to get started</p>
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter your email"
              >
              <div 
                *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
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
                *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                class="error-message"
              >
                Password must be at least 8 characters
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
              >
              <div 
                *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
                class="error-message"
              >
                Passwords do not match
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="submit-button"
              >
                {{ isLoading ? 'Creating account...' : 'Register' }}
              </button>
            </div>
          </form>

          <div class="divider">
            <span>or</span>
          </div>

          <div class="social-auth">
            <button 
              (click)="registerWithGoogle()"
              [disabled]="isLoading"
              class="google-button"
            >
              <img src="assets/icons/google.svg" alt="Google" width="20" height="20">
              Continue with Google
            </button>
            <button 
              (click)="registerWithApple()"
              [disabled]="isLoading"
              class="apple-button"
            >
              <img src="assets/icons/apple.svg" alt="Apple" width="20" height="20">
              Continue with Apple
            </button>
          </div>

          <div class="auth-footer">
            <p>
              Already have an account?
              <a routerLink="/auth/login">Login</a>
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
      margin-top: 1.5rem;
    }

    .submit-button {
      width: 100%;
      padding: 0.75rem;
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
    }

    .google-button,
    .apple-button {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .google-button:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #cbd5e0;
    }

    .apple-button {
      background: #000;
      color: white;
      border: none;
    }

    .apple-button:hover:not(:disabled) {
      background: #1a1a1a;
    }

    .google-button:disabled,
    .apple-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.error = null;

      const { email, password } = this.registerForm.value;

      this.authService.register({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    }
  }

  registerWithGoogle(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.error = null;

      this.authService.loginWithGoogle().subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    }
  }

  registerWithApple(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.error = null;

      this.authService.loginWithApple().subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
        }
      });
    }
  }
}