import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPreferencesComponent } from '../../settings/notification-preferences/notification-preferences.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, NotificationPreferencesComponent],
  template: `
    <div class="notifications-page">
      <div class="notifications-container">
        <div class="notifications-header">
          <h2>Notifications</h2>
          <div class="header-actions">
            <button (click)="markAllAsRead()" class="action-button">
              Mark all as read
            </button>
            <button (click)="showPreferences = !showPreferences" class="action-button">
              Preferences
            </button>
          </div>
        </div>

        <div class="notifications-content">
          <div class="notifications-list">
            <div
              *ngFor="let notification of notifications$ | async"
              class="notification-item"
              [class.unread]="notification.status === 'unread'"
              [class.priority-high]="notification.priority === 'high'"
            >
              <div class="notification-content">
                <h4>{{ notification.title }}</h4>
                <p>{{ notification.message }}</p>
                <span class="notification-time">
                  {{ formatTime(notification.createdAt) }}
                </span>
              </div>

              <div class="notification-actions">
                <div class="action-buttons">
                  <button
                    *ngFor="let action of notification.actions"
                    (click)="handleAction(action, notification)"
                    class="action-button"
                  >
                    {{ action.label }}
                  </button>
                </div>
                <button
                  (click)="dismissNotification(notification.id)"
                  class="dismiss-button"
                >
                  ×
                </button>
              </div>
            </div>

            <div *ngIf="(notifications$ | async)?.length === 0" class="no-notifications">
              No notifications
            </div>
          </div>

          <div *ngIf="showPreferences" class="preferences-panel">
            <app-notification-preferences></app-notification-preferences>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-page {
      padding: 2rem;
    }

    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .notifications-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .notifications-content {
      display: flex;
      gap: 2rem;
    }

    .notifications-list {
      flex: 1;
      padding: 1.5rem;
    }

    .notification-item {
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
      margin-bottom: 1rem;
      transition: all 0.2s;
    }

    .notification-item.unread {
      background: #e3f2fd;
    }

    .notification-item.priority-high {
      border-left: 4px solid #dc3545;
    }

    .notification-content h4 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
    }

    .notification-content p {
      margin: 0;
      color: #666;
    }

    .notification-time {
      display: block;
      font-size: 0.875rem;
      color: #999;
      margin-top: 0.5rem;
    }

    .notification-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .action-button:hover {
      background: #0056b3;
    }

    .dismiss-button {
      padding: 0.25rem 0.5rem;
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #666;
      cursor: pointer;
    }

    .dismiss-button:hover {
      color: #dc3545;
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .preferences-panel {
      width: 300px;
      padding: 1.5rem;
      border-left: 1px solid #eee;
    }

    @media (max-width: 768px) {
      .notifications-content {
        flex-direction: column;
      }

      .preferences-panel {
        width: auto;
        border-left: none;
        border-top: 1px solid #eee;
      }
    }
  `]
})
export class NotificationListComponent {
  notifications$ = this.notificationService.notifications$;
  showPreferences = false;

  constructor(private notificationService: NotificationService) {}

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  handleAction(action: any, notification: any): void {
    this.notificationService.markAsRead(notification.id);
    // Handle specific actions based on action.action type
  }

  dismissNotification(id: string): void {
    this.notificationService.dismiss(id);
  }

  markAllAsRead(): void {
    this.notifications$.subscribe(notifications => {
      notifications
        .filter(n => n.status === 'unread')
        .forEach(n => this.notificationService.markAsRead(n.id));
    });
  }
}