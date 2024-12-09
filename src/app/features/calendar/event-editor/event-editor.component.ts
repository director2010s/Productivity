import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarService } from '../../../core/services/calendar.service';
import { TaskService } from '../../../core/services/task.service';
import { NoteService } from '../../../core/services/note.service';
import { CalendarEvent } from '../../../core/models/calendar-event.model';

@Component({
  selector: 'app-event-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="event-editor">
      <h2>{{ isEditing ? 'Edit Event' : 'New Event' }}</h2>

      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="event-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="Event title"
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="start">Start</label>
            <input
              id="start"
              type="datetime-local"
              formControlName="start"
            >
          </div>

          <div class="form-group">
            <label for="end">End</label>
            <input
              id="end"
              type="datetime-local"
              formControlName="end"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            placeholder="Event description"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="location">Location</label>
          <input
            id="location"
            type="text"
            formControlName="location"
            placeholder="Event location"
          >
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              formControlName="allDay"
            >
            All day event
          </label>
        </div>

        <div class="form-group">
          <label for="color">Color</label>
          <input
            id="color"
            type="color"
            formControlName="color"
          >
        </div>

        <div class="form-actions">
          <button type="button" (click)="onCancel()">Cancel</button>
          <button
            type="submit"
            [disabled]="eventForm.invalid"
            class="save-button"
          >
            {{ isEditing ? 'Update' : 'Create' }} Event
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .event-editor {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .event-form {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input, textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    input[type="checkbox"] {
      width: auto;
    }

    input[type="color"] {
      height: 2.5rem;
      padding: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .save-button {
      background: #28a745;
      color: white;
    }

    .save-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  `]
})
export class EventEditorComponent implements OnInit {
  eventForm: FormGroup;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private taskService: TaskService,
    private noteService: NoteService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      description: [''],
      location: [''],
      allDay: [false],
      color: ['#3788d8']
    });
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.isEditing = true;
      this.loadEvent(eventId);
    }
  }

  private loadEvent(id: string): void {
    this.calendarService.events$.subscribe(events => {
      const event = events.find(e => e.id === id);
      if (event) {
        this.eventForm.patchValue({
          ...event,
          start: this.formatDateTime(event.start),
          end: this.formatDateTime(event.end)
        });
      }
    });
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const event = {
        ...formValue,
        start: new Date(formValue.start),
        end: new Date(formValue.end)
      };

      if (this.isEditing) {
        const eventId = this.route.snapshot.paramMap.get('id');
        if (eventId) {
          this.calendarService.updateEvent(eventId, event);
        }
      } else {
        this.calendarService.addEvent(event);
      }

      this.router.navigate(['/calendar']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/calendar']);
  }
}