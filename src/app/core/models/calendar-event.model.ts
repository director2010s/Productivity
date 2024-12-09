export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
  taskIds?: string[];
  noteIds?: string[];
  reminders?: {
    time: Date;
    type: 'email' | 'notification';
  }[];
  color?: string;
  source?: 'local' | 'google' | 'icloud';
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}