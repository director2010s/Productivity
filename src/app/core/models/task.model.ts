import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  archived: boolean;
  dueDate?: Date | Timestamp;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}