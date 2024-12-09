import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <h2>Profile Settings</h2>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
        <div class="form-group">
          <label for="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            formControlName="displayName"
            placeholder="Enter your display name"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            [readonly]="true"
          >
        </div>

        <div class="profile-actions">
          <button type="submit" [disabled]="!profileForm.dirty || profileForm.invalid">
            Save Changes
          </button>
        </div>
      </form>

      <div class="account-section">
        <h3>Account</h3>
        <button (click)="resetPassword()" class="secondary-button">
          Reset Password
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-form {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 1.5rem;
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

    input[readonly] {
      background-color: #f7fafc;
      cursor: not-allowed;
    }

    .profile-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    button {
      padding: 0.75rem 1.5rem;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover:not(:disabled) {
      background: #3182ce;
    }

    button:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    .account-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }

    .secondary-button {
      background: #718096;
    }

    .secondary-button:hover {
      background: #4a5568;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          displayName: user.displayName || '',
          email: user.email
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid && this.profileForm.dirty) {
      // Profile update logic will be implemented
      console.log('Update profile:', this.profileForm.value);
    }
  }

  resetPassword() {
    const email = this.profileForm.get('email')?.value;
    if (email) {
      this.authService.resetPassword(email).subscribe({
        next: () => {
          alert('Password reset email sent. Please check your inbox.');
        },
        error: (error) => {
          alert(error);
        }
      });
    }
  }
}