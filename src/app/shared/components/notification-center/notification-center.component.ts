import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-center">
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-actions">
          <button (click)="markAllAsRead()">Mark all as read</button>
          <button (click)="openPreferences()">Preferences</button>
        </div>
      </div>

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
    </div>
  `,
  styles: [`
    .notification-center {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
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
      font-size: 0.875rem;
    }

    .notification-time {
      display: block;
      font-size: 0.75rem;
      color: #999;
      margin-top: 0.25rem;
    }

    .notification-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .dismiss-button {
      padding: 0.25rem 0.5rem;
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #666;
      cursor: pointer;
    }

    .no-notifications {
      padding: 2rem;
      text-align: center;
      color: #666;
    }
  `]
})
export class NotificationCenterComponent implements OnInit {
  notifications$ = this.notificationService.notifications$;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {}

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

  handleAction(action: any, notification: Notification): void {
    this.notificationService.markAsRead(notification.id);

    switch (action.action) {
      case 'view':
        if (notification.resourceType === 'task') {
          this.router.navigate(['/tasks'], { queryParams: { id: action.data.taskId } });
        } else if (notification.resourceType === 'event') {
          this.router.navigate(['/calendar'], { queryParams: { id: action.data.eventId } });
        }
        break;
      case 'complete':
        if (notification.resourceType === 'task') {
          // Handle task completion
        }
        break;
    }
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

  openPreferences(): void {
    this.router.navigate(['/settings/notifications']);
  }
}