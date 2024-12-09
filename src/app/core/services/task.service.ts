import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, from, switchMap } from 'rxjs';
import { Task } from '../models/task.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();
  private readonly COLLECTION_NAME = 'tasks';

  constructor(private firebaseService: FirebaseService) {
    // Only load tasks when we have a valid user ID
    this.firebaseService.userId$.subscribe(userId => {
      if (userId) {
        this.loadTasks();
      } else {
        // Clear tasks when user is not authenticated
        this.tasksSubject.next([]);
      }
    });
  }

  private async loadTasks(): Promise<void> {
    try {
      const tasks = await this.firebaseService.getCollection<Task>(this.COLLECTION_NAME);
      this.tasksSubject.next(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Don't clear tasks on error, maintain last known state
      if (this.tasksSubject.value.length === 0) {
        this.tasksSubject.next([]);
      }
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const newTask = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.firebaseService.addDocument<Task>(this.COLLECTION_NAME, newTask);
      await this.loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add task. Please ensure you are logged in and try again.');
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      await this.firebaseService.updateDocument(this.COLLECTION_NAME, id, updates);
      await this.loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.firebaseService.deleteDocument(this.COLLECTION_NAME, id);
      await this.loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  getTasksByFilter(filter: 'all' | 'active' | 'completed'): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => {
        switch (filter) {
          case 'active':
            return tasks.filter(task => !task.completed);
          case 'completed':
            return tasks.filter(task => task.completed);
          default:
            return tasks;
        }
      })
    );
  }

  getUpcomingTasks(): Observable<Task[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate >= now && dueDate <= tomorrow;
      }))
    );
  }

  async reorderTasks(taskIds: string[]): Promise<void> {
    try {
      // Update each task with its new order
      const updatePromises = taskIds.map((id, index) => 
        this.firebaseService.updateDocument(this.COLLECTION_NAME, id, { order: index })
      );
      await Promise.all(updatePromises);
      await this.loadTasks();
    } catch (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  }
}