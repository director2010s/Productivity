import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, from, switchMap } from 'rxjs';
import { Task } from '../models/task.model';
import { FirebaseService } from './firebase.service';
import { Timestamp } from 'firebase/firestore';

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
      console.log("addTask.dueDate:",task.dueDate)
      const dueDate = task.dueDate instanceof Date ? task.dueDate : task.dueDate instanceof Timestamp ? task.dueDate?.toDate() : task.dueDate?new Date(task.dueDate): new Date();
      console.log("addTask.dueDateDone:",dueDate)
      const timestamp = task.dueDate ? Timestamp.fromDate(dueDate?dueDate:new Date()) : Timestamp.fromDate(new Date()); // Ensure timestamp is never null
      const newTask = {
        ...task,
        dueDate: timestamp,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: task.tags || [] // Ensure tags are not undefined
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

  getTasksByFilter(filter: 'all' | 'open' | 'closed' | 'archived'): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => {
        if (!tasks) return [];
        
        switch (filter) {
          case 'open':
            return tasks.filter(task => !task.completed && !task.archived);
          case 'closed':
            return tasks.filter(task => task.completed && !task.archived);
          case 'archived':
            return tasks.filter(task => task.archived);
          default:
            return tasks.filter(task => !task.archived);
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
        const dueDate = task.dueDate instanceof Date 
          ? task.dueDate 
          : task.dueDate instanceof Timestamp 
            ? task.dueDate.toDate() 
            : new Date(task.dueDate);
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