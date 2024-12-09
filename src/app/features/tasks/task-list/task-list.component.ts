import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TaskFormComponent],
  template: `
    <div class="task-list-container">
      <div class="task-header">
        <h2>Tasks</h2>
        <button (click)="showAddTask = true" class="add-button">Add Task</button>
      </div>

      <app-task-form
        *ngIf="showAddTask || editingTask"
        [task]="editingTask"
        (taskCreated)="onTaskCreated($event)"
        (taskUpdated)="onTaskUpdated($event)"
        (cancel)="cancelEdit()"
      ></app-task-form>

      <div class="task-filters">
        <button 
          *ngFor="let filter of filters"
          (click)="setFilter(filter.value)"
          [class.active]="currentFilter === filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div 
        cdkDropList 
        (cdkDropListDropped)="onDrop($event)"
        class="task-items"
      >
        <div 
          *ngFor="let task of filteredTasks$ | async"
          class="task-item"
          cdkDrag
          [class.completed]="task.completed"
          (click)="editTask(task)"
        >
          <div class="task-content">
            <input 
              type="checkbox" 
              [checked]="task.completed"
              (change)="toggleTask(task)"
              (click)="$event.stopPropagation()"
            >
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-description" *ngIf="task.description">{{ task.description }}</div>
              <div class="task-metadata">
                <span class="due-date" *ngIf="task.dueDate">Due: {{ task.dueDate | date:'mediumDate' }}</span>
                <span class="priority-badge" [class]="'priority-' + task.priority">
                  {{ task.priority }}
                </span>
              </div>
            </div>
          </div>
          <button 
            class="delete-button" 
            (click)="$event.stopPropagation(); deleteTask(task.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .add-button {
      background-color: #28a745;
    }

    .task-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .task-filters button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #f8f9fa;
      cursor: pointer;
    }

    .task-filters button.active {
      background-color: #007bff;
      color: white;
    }

    .task-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: move;
    }

    .task-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .task-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .task-description {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .task-metadata {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .priority-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      text-transform: capitalize;
    }

    .priority-high {
      background-color: #dc3545;
      color: white;
    }

    .priority-medium {
      background-color: #ffc107;
      color: black;
    }

    .priority-low {
      background-color: #28a745;
      color: white;
    }

    .delete-button {
      background-color: #dc3545;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                  0 8px 10px 1px rgba(0,0,0,0.14),
                  0 3px 14px 2px rgba(0,0,0,0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TaskListComponent implements OnInit {
  showAddTask = false;
  editingTask: Task | null = null;
  currentFilter: 'all' | 'active' | 'completed' = 'all';
  filteredTasks$ = this.taskService.getTasksByFilter(this.currentFilter);

  filters = [
    { label: 'All', value: 'all' as const },
    { label: 'Active', value: 'active' as const },
    { label: 'Completed', value: 'completed' as const }
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.setFilter(this.currentFilter);
  }

  setFilter(filter: typeof this.currentFilter): void {
    this.currentFilter = filter;
    this.filteredTasks$ = this.taskService.getTasksByFilter(filter);
  }

  onTaskCreated(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.taskService.addTask(task);
    this.showAddTask = false;
  }

  onTaskUpdated(task: Task): void {
    this.taskService.updateTask(task.id, task);
    this.editingTask = null;
  }

  toggleTask(task: Task): void {
    this.taskService.updateTask(task.id, { completed: !task.completed });
  }

  editTask(task: Task): void {
    this.editingTask = { ...task };
    this.showAddTask = false;
  }

  cancelEdit(): void {
    this.editingTask = null;
    this.showAddTask = false;
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }

  async onDrop(event: CdkDragDrop<Task[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;

    const tasks = await firstValueFrom(this.taskService.tasks$.pipe(take(1)));
    if (!tasks) return;

    moveItemInArray(tasks, event.previousIndex, event.currentIndex);
    const taskIds = tasks.map(task => task.id);
    await this.taskService.reorderTasks(taskIds);
  }
}