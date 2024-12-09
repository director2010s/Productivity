import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-menu" *ngIf="currentUser$ | async as user">
      <div class="user-info" (click)="toggleMenu()">
        <img 
          [src]="user.photoURL || '/assets/images/default-avatar.svg'"
          [alt]="user.displayName || user.email"
          class="user-avatar"
        >
        <span class="user-name">{{ user.displayName || user.email }}</span>
      </div>

      <div class="menu-dropdown" *ngIf="isMenuOpen">
        <div class="menu-item" (click)="navigateToProfile()">
          Profile Settings
        </div>
        <div class="menu-item" (click)="logout()">
          Logout
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-menu {
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
    }

    .user-info:hover {
      background: rgba(0,0,0,0.05);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 200px;
      z-index: 1000;
    }

    .menu-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
    }

    .menu-item:hover {
      background: #f8f9fa;
    }
  `]
})
export class UserMenuComponent {
  currentUser$ = this.authService.currentUser$;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToProfile(): void {
    this.isMenuOpen = false;
    this.router.navigate(['/settings/profile']);
  }

  logout(): void {
    this.isMenuOpen = false;
    this.authService.logout().subscribe();
  }
}