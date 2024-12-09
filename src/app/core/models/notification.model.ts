export type NotificationType = 'task' | 'event' | 'ai' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationStatus = 'unread' | 'read' | 'dismissed';

export interface NotificationPreferences {
  taskReminders: boolean;
  eventReminders: boolean;
  aiSuggestions: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderTiming: number; // minutes before due date
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  resourceId?: string;
  resourceType?: string;
  scheduledFor?: Date;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  actions?: {
    label: string;
    action: string;
    data?: any;
  }[];
}