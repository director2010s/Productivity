import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { DateUtils } from '../../../core/utils/date.utils';
import { Observable } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TaskFormComponent],
  template: `
    <div class="task-list-container">
      <div class="task-header">
        <div class="header-content">
          <h2>Today's Task</h2>
          <p class="date">{{ today | date:'EEEE, dd MMM' }}</p>
        </div>
        <button (click)="showAddTask = true" class="new-task-btn">
          <span>+</span> New Task
        </button>
      </div>

      <div class="task-filters">
        <button 
          [class.active]="currentFilter === 'all'"
          (click)="setFilter('all')"
          class="filter-btn">
          All <span class="count">{{ (tasks$ | async)?.length || 0 }}</span>
        </button>
        <button 
          [class.active]="currentFilter === 'open'"
          (click)="setFilter('open')"
          class="filter-btn">
          Open <span class="count">{{ getFilteredCount('open') }}</span>
        </button>
        <button 
          [class.active]="currentFilter === 'closed'"
          (click)="setFilter('closed')"
          class="filter-btn">
          Closed <span class="count">{{ getFilteredCount('closed') }}</span>
        </button>
        <button 
          [class.active]="currentFilter === 'archived'"
          (click)="setFilter('archived')"
          class="filter-btn">
          Archived <span class="count">{{ getFilteredCount('archived') }}</span>
        </button>
      </div>

      <div class="tasks-wrapper" *ngIf="!showAddTask">
        <div *ngFor="let task of filteredTasks$ | async" 
             class="task-item"
             [class.completed]="task.completed"
             (click)="toggleTaskComplete(task)">
          <div class="task-content">
            <div class="task-info">
              <h3>{{ task.title }}</h3>
              <p class="subtitle">{{ task.description }}</p>
            </div>
            <div class="task-time" *ngIf="task.dueDate">
              Today {{ getDate(task.dueDate) | date:'h:mm a' }}
            </div>
          </div>
          <div class="completion-indicator">
            <div class="check-circle" [class.checked]="task.completed">
              <svg *ngIf="task.completed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          </div>
          <button (click)="editTask(task)" class="edit-task-btn">
            Edit
          </button>
        </div>
      </div>

      <app-task-form 
        *ngIf="showAddTask"
        [task]="editingTask"
        (close)="showAddTask = false; editingTask = null;"
        (taskAdded)="onTaskAdded($event)"
        (taskUpdated)="onTaskUpdated($event)">
      </app-task-form>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-content h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #1a1a1a;
    }

    .date {
      color: #666;
      margin: 4px 0 0;
      font-size: 14px;
    }

    .new-task-btn {
      background: #4169E1;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }

    .new-task-btn:hover {
      background: #3157cc;
    }

    .task-filters {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .filter-btn {
      background: none;
      border: none;
      padding: 8px 16px;
      color: #666;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
    }

    .filter-btn.active {
      color: #4169E1;
      font-weight: 500;
    }

    .filter-btn.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #4169E1;
      border-radius: 2px;
    }

    .count {
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 12px;
      margin-left: 8px;
      font-size: 12px;
    }

    .tasks-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .task-item {
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid #eee;
    }

    .task-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .task-content {
      flex: 1;
      margin-right: 16px;
    }

    .task-info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #666;
    }

    .task-time {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }

    .completion-indicator {
      flex-shrink: 0;
    }

    .check-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .check-circle.checked {
      background: #4169E1;
      border-color: #4169E1;
    }

    .check-circle svg {
      width: 16px;
      height: 16px;
      fill: white;
    }

    .task-item.completed .task-info h3 {
      color: #999;
      text-decoration: line-through;
    }

    .task-item.completed .subtitle {
      color: #999;
    }

    .edit-task-btn {
      background: none;
      border: none;
      padding: 8px 16px;
      color: #666;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
    }
  `]
})
export class TaskListComponent implements OnInit {
  today: string = '2024-12-10T04:30:50+09:00';
  showAddTask = false;
  editingTask: Task | null = null;
  currentFilter: 'all' | 'open' | 'closed' | 'archived' = 'all';
  tasks$: Observable<Task[]> = this.taskService.getTasksByFilter(this.currentFilter);
  filteredTasks$ = this.tasks$;
  dateUtils = DateUtils;
  taskCounts: { [key: string]: number } = {
    open: 0,
    closed: 0,
    archived: 0
  };

  constructor(private taskService: TaskService) {
    // Initialize counts for each filter
    ['open', 'closed', 'archived'].forEach(filter => {
      this.taskService.getTasksByFilter(filter as 'open' | 'closed' | 'archived')
        .subscribe(tasks => {
          this.taskCounts[filter] = tasks.length;
        });
    });
  }

  ngOnInit(): void {
    this.setFilter(this.currentFilter);
  }

  setFilter(filter: typeof this.currentFilter): void {
    this.currentFilter = filter;
    this.tasks$ = this.taskService.getTasksByFilter(filter);
    this.filteredTasks$ = this.tasks$;
  }

  onTaskAdded(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: task.title,
      archived: false,
      completed: false,
      priority: task.priority,
      dueDate: task.dueDate,
      description: task.description,
      tags: task.tags
    };
    this.taskService.addTask(taskData);
    this.showAddTask = false;
  }

  onTaskUpdated(task: Task): void {
    this.taskService.updateTask(task.id, task);
    this.showAddTask = false;
    this.editingTask = null;
  }

  toggleTaskComplete(task: Task): void {
    this.taskService.updateTask(task.id, { completed: !task.completed });
  }

  getFilteredCount(filter: 'open' | 'closed' | 'archived'): number {
    return this.taskCounts[filter];
  }

  getDate(date: Date | Timestamp | undefined): Date | undefined {
    if (!date) return undefined;
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return date;
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.showAddTask = true;
  }
}