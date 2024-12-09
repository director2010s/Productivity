import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollaborationService } from '../../../core/services/collaboration.service';
import { ShareSettings, SharePermission } from '../../../core/models/share.model';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="share-dialog">
      <div class="dialog-header">
        <h3>Share</h3>
        <button (click)="close.emit()" class="close-button">×</button>
      </div>

      <div class="share-form">
        <div class="input-group">
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="Enter email address"
            class="email-input"
          >
          <select [(ngModel)]="permission" class="permission-select">
            <option value="view">Can view</option>
            <option value="edit">Can edit</option>
            <option value="admin">Admin</option>
          </select>
          <button 
            (click)="shareWithUser()"
            [disabled]="!isValidEmail()"
            class="share-button"
          >
            Share
          </button>
        </div>
      </div>

      <div class="shared-users" *ngIf="shareSettings">
        <h4>Shared with</h4>
        <div 
          *ngFor="let share of shareSettings.sharedWith"
          class="shared-user"
        >
          <span>{{ share.email }}</span>
          <div class="user-actions">
            <select 
              [(ngModel)]="share.permission"
              (change)="updatePermission(share.email, $event)"
            >
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
              <option value="admin">Admin</option>
            </select>
            <button 
              (click)="removeShare(share.email)"
              class="remove-button"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div class="active-collaborators">
        <h4>Currently editing</h4>
        <div 
          *ngFor="let user of activeCollaborators$ | async"
          class="collaborator"
        >
          <span 
            class="collaborator-indicator"
            [style.background-color]="user.color"
          ></span>
          <span>{{ user.name || user.email }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .share-dialog {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      width: 100%;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .share-form {
      margin-bottom: 1.5rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    .email-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .permission-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .share-button {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .share-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .shared-users {
      margin-top: 1.5rem;
    }

    .shared-user {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
    }

    .remove-button {
      padding: 0.25rem 0.5rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .active-collaborators {
      margin-top: 1.5rem;
    }

    .collaborator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
    }

    .collaborator-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  `]
})
export class ShareDialogComponent {
  @Input() resourceId!: string;
  @Input() resourceType!: ShareSettings['resourceType'];
  @Input() shareSettings?: ShareSettings;
  @Output() close = new EventEmitter<void>();

  email = '';
  permission: SharePermission = 'view';
  activeCollaborators$ = this.collaborationService.activeCollaborators$;

  constructor(private collaborationService: CollaborationService) {}

  shareWithUser(): void {
    if (this.isValidEmail()) {
      this.collaborationService.shareResource(
        this.resourceId,
        this.resourceType,
        this.email,
        this.permission
      );
      this.email = '';
    }
  }

  updatePermission(email: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.collaborationService.shareResource(
      this.resourceId,
      this.resourceType,
      email,
      select.value as SharePermission
    );
  }

  removeShare(email: string): void {
    this.collaborationService.removeShare(this.resourceId, email);
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}