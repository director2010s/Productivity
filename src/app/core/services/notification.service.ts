import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, map } from 'rxjs';
import { TaskService } from './task.service';
import { CalendarService } from './calendar.service';
import { 
  Notification, 
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  NotificationStatus 
} from '../models/notification.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private preferencesSubject = new BehaviorSubject<NotificationPreferences>({
    taskReminders: true,
    eventReminders: true,
    aiSuggestions: true,
    emailNotifications: true,
    pushNotifications: true,
    reminderTiming: 30, // 30 minutes before
    quietHoursStart: '08:00',
    quietHoursEnd: '17:00'
  });
  private readonly COLLECTION_NAME = 'notifications';
  private readonly PREFERENCES_COLLECTION_NAME = 'notification-preferences';

  notifications$ = this.notificationsSubject.asObservable();
  preferences$ = this.preferencesSubject.asObservable();
  unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => n.status === 'unread').length)
  );

  constructor(
    private taskService: TaskService,
    private calendarService: CalendarService,
    private firebaseService: FirebaseService
  ) {
    this.loadPreferences();
    this.loadNotifications();
    this.setupNotificationChecks();
    this.requestNotificationPermission();
    // Subscribe to user changes to reload notifications and preferences
    this.firebaseService.userId$.subscribe(() => {
      this.loadPreferences();
      this.loadNotifications();
    });
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }

  private setupNotificationChecks(): void {
    // Check for upcoming tasks and events every minute
    interval(60000).subscribe(() => {
      this.checkUpcomingTasks();
      this.checkUpcomingEvents();
      this.generateAISuggestions();
    });
  }

  private checkUpcomingTasks(): void {
    const preferences = this.preferencesSubject.value;
    if (!preferences.taskReminders) return;

    this.taskService.getUpcomingTasks().subscribe(tasks => {
      tasks.forEach(task => {
        if (task.dueDate && this.shouldNotify(task.dueDate)) {
          this.addNotification({
            type: 'task',
            title: 'Task Due Soon',
            message: `Task "${task.title}" is due in ${preferences.reminderTiming} minutes`,
            priority: 'high',
            resourceId: task.id,
            resourceType: 'task',
            scheduledFor: new Date(task.dueDate),
            actions: [
              {
                label: 'View Task',
                action: 'view',
                data: { taskId: task.id }
              },
              {
                label: 'Mark Complete',
                action: 'complete',
                data: { taskId: task.id }
              }
            ]
          });
        }
      });
    });
  }

  private checkUpcomingEvents(): void {
    const preferences = this.preferencesSubject.value;
    if (!preferences.eventReminders) return;

    this.calendarService.getUpcomingEvents(1).subscribe(events => {
      events.forEach(event => {
        if (this.shouldNotify(event.start)) {
          this.addNotification({
            type: 'event',
            title: 'Upcoming Event',
            message: `Event "${event.title}" starts in ${preferences.reminderTiming} minutes`,
            priority: 'medium',
            resourceId: event.id,
            resourceType: 'event',
            scheduledFor: event.start,
            actions: [
              {
                label: 'View Event',
                action: 'view',
                data: { eventId: event.id }
              }
            ]
          });
        }
      });
    });
  }

  private generateAISuggestions(): void {
    const preferences = this.preferencesSubject.value;
    if (!preferences.aiSuggestions) return;

    // AI suggestion logic will be implemented in the next iteration
    // This could include task prioritization, scheduling suggestions, etc.
  }

  private shouldNotify(date: Date): boolean {
    const preferences = this.preferencesSubject.value;
    const now = new Date();
    const targetDate = new Date(date);
    const diffMinutes = (targetDate.getTime() - now.getTime()) / (1000 * 60);

    // Check if we're within the reminder window
    if (diffMinutes <= preferences.reminderTiming && diffMinutes > 0) {
      // Check quiet hours if set
      if (preferences.quietHoursStart && preferences.quietHoursEnd) {
        const currentHour = now.getHours();
        const [startHour] = preferences.quietHoursStart.split(':').map(Number);
        const [endHour] = preferences.quietHoursEnd.split(':').map(Number);

        if (startHour <= endHour) {
          return currentHour < startHour || currentHour >= endHour;
        } else {
          return currentHour < startHour && currentHour >= endHour;
        }
      }
      return true;
    }
    return false;
  }

  private async loadNotifications(): Promise<void> {
    try {
      const notifications = await this.firebaseService.getCollection<Notification>(this.COLLECTION_NAME);
      this.notificationsSubject.next(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notificationsSubject.next([]);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const prefs = await this.firebaseService.getCollection<NotificationPreferences>(this.PREFERENCES_COLLECTION_NAME);
      if (prefs && prefs.length > 0) {
        this.preferencesSubject.next(prefs[0]);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  async addNotification(notification: Omit<Notification, 'id' | 'status' | 'createdAt'>): Promise<void> {
    try {
      const newNotification = {
        ...notification,
        id: crypto.randomUUID(),
        status: 'unread' as NotificationStatus,
        createdAt: new Date()
      };
      await this.firebaseService.addDocument<Notification>(this.COLLECTION_NAME, newNotification);
      await this.loadNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<void> {
    try {
      await this.firebaseService.updateDocument(this.COLLECTION_NAME, id, updates);
      await this.loadNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await this.firebaseService.deleteDocument(this.COLLECTION_NAME, id);
      await this.loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await this.firebaseService.updateDocument(this.COLLECTION_NAME, id, { status: 'read' });
      await this.loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async dismiss(id: string): Promise<void> {
    try {
      await this.firebaseService.updateDocument(this.COLLECTION_NAME, id, { status: 'dismissed' });
      await this.loadNotifications();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await this.firebaseService.updateDocument(this.PREFERENCES_COLLECTION_NAME, 'preferences', preferences);
      await this.loadPreferences();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(notification => notification.status === 'unread'))
    );
  }

  getNotificationsByType(type: string): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(notification => notification.type === type))
    );
  }

  getNotificationsByPriority(priority: 'high' | 'medium' | 'low'): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(notification => notification.priority === priority))
    );
  }

  private async showNotification(notification: Notification): Promise<void> {
    const preferences = this.preferencesSubject.value;

    // Browser notification
    if (preferences.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png'
      });
    }

    // Email notification
    if (preferences.emailNotifications) {
      // Email notification logic will be implemented
      console.log('Sending email notification:', notification);
    }
  }
}