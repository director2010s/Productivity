import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPreferences } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="preferences-container">
      <h2>Notification Preferences</h2>

      <div class="preferences-form">
        <div class="preference-group">
          <h3>Notification Types</h3>
          
          <label class="preference-item">
            <input
              type="checkbox"
              [(ngModel)]="preferences.taskReminders"
              (ngModelChange)="updatePreferences()"
            >
            Task Reminders
          </label>

          <label class="preference-item">
            <input
              type="checkbox"
              [(ngModel)]="preferences.eventReminders"
              (ngModelChange)="updatePreferences()"
            >
            Event Reminders
          </label>

          <label class="preference-item">
            <input
              type="checkbox"
              [(ngModel)]="preferences.aiSuggestions"
              (ngModelChange)="updatePreferences()"
            >
            AI Suggestions
          </label>
        </div>

        <div class="preference-group">
          <h3>Delivery Methods</h3>
          
          <label class="preference-item">
            <input
              type="checkbox"
              [(ngModel)]="preferences.emailNotifications"
              (ngModelChange)="updatePreferences()"
            >
            Email Notifications
          </label>

          <label class="preference-item">
            <input
              type="checkbox"
              [(ngModel)]="preferences.pushNotifications"
              (ngModelChange)="updatePreferences()"
            >
            Push Notifications
          </label>
        </div>

        <div class="preference-group">
          <h3>Timing</h3>
          
          <div class="preference-item">
            <label>Reminder Timing (minutes before)</label>
            <input
              type="number"
              [(ngModel)]="preferences.reminderTiming"
              (ngModelChange)="updatePreferences()"
              min="1"
              max="1440"
            >
          </div>

          <div class="quiet-hours">
            <h4>Quiet Hours</h4>
            <div class="time-inputs">
              <div class="time-input">
                <label>Start</label>
                <input
                  type="time"
                  [(ngModel)]="preferences.quietHoursStart"
                  (ngModelChange)="updatePreferences()"
                >
              </div>
              <div class="time-input">
                <label>End</label>
                <input
                  type="time"
                  [(ngModel)]="preferences.quietHoursEnd"
                  (ngModelChange)="updatePreferences()"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preferences-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .preferences-form {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .preference-group {
      margin-bottom: 2rem;
    }

    .preference-group h3 {
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .preference-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .preference-item input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
    }

    .preference-item input[type="number"] {
      width: 100px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .quiet-hours {
      margin-top: 1.5rem;
    }

    .time-inputs {
      display: flex;
      gap: 1rem;
    }

    .time-input {
      flex: 1;
    }

    .time-input label {
      display: block;
      margin-bottom: 0.5rem;
    }

    .time-input input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class NotificationPreferencesComponent {
  preferences: NotificationPreferences = {
    taskReminders: true,
    eventReminders: true,
    aiSuggestions: true,
    emailNotifications: true,
    pushNotifications: true,
    reminderTiming: 30
  };

  constructor(private notificationService: NotificationService) {
    this.notificationService.preferences$.subscribe(prefs => {
      this.preferences = { ...prefs };
    });
  }

  updatePreferences(): void {
    this.notificationService.updatePreferences(this.preferences);
  }
}