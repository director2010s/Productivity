import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
      <div class="form-group">
        <label for="title">Title</label>
        <input 
          id="title"
          type="text"
          formControlName="title"
          placeholder="Enter task title"
        >
        <div 
          *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
          class="error-message"
        >
          Title is required
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          formControlName="description"
          placeholder="Enter task description"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          formControlName="dueDate"
        >
      </div>

      <div class="form-group">
        <label for="priority">Priority</label>
        <select id="priority" formControlName="priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" (click)="onCancel()">Cancel</button>
        <button type="submit" [disabled]="taskForm.invalid">
          {{ task ? 'Update' : 'Create' }} Task
        </button>
      </div>
    </form>
  `,
  styles: [`
    .task-form {
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    textarea {
      resize: vertical;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    button[type="submit"] {
      background-color: #007bff;
      color: white;
    }

    button[type="submit"]:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    button[type="button"] {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() taskCreated = new EventEmitter<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [null],
      priority: ['medium'],
      completed: [false]
    });
  }

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        dueDate: this.task.dueDate ? this.formatDateForInput(this.task.dueDate) : null,
        priority: this.task.priority,
        completed: this.task.completed
      });
    }
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    const taskData = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || '',
      dueDate: formValue.dueDate ? new Date(formValue.dueDate + 'T00:00:00') : undefined,
      priority: formValue.priority,
      completed: formValue.completed
    };

    if (this.task) {
      this.taskUpdated.emit({ ...this.task, ...taskData });
    } else {
      this.taskCreated.emit(taskData);
    }

    this.resetForm();
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      dueDate: null,
      priority: 'medium',
      completed: false
    });
    
    // Mark the form as pristine and untouched to reset validation states
    this.taskForm.markAsPristine();
    this.taskForm.markAsUntouched();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}