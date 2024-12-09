import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NoteService } from '../../../core/services/note.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notes-list">
      <div class="list-header">
        <h2>Notes</h2>
        <button (click)="createNewNote()" class="new-note-button">
          New Note
        </button>
      </div>

      <div class="notes-grid">
        <div 
          *ngFor="let note of notes$ | async"
          class="note-card"
          (click)="editNote(note.id)"
        >
          <h3>{{ note.title }}</h3>
          <div class="note-preview" [innerHTML]="getPreview(note.content)"></div>
          <div class="note-footer">
            <div class="note-tags">
              <span *ngFor="let tag of note.tags" class="tag">{{ tag }}</span>
            </div>
            <span class="note-date">
              {{ formatDate(note.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notes-list {
      padding: 2rem;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .new-note-button {
      padding: 0.5rem 1rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .note-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .note-card h3 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
    }

    .note-preview {
      color: #666;
      margin-bottom: 1rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .note-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .note-tags {
      display: flex;
      gap: 0.5rem;
    }

    .tag {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .note-date {
      font-size: 0.875rem;
      color: #999;
    }
  `]
})
export class NoteListComponent {
  notes$ = this.noteService.notes$;

  constructor(
    private noteService: NoteService,
    private router: Router
  ) {}

  createNewNote(): void {
    this.router.navigate(['/notes/new']);
  }

  editNote(id: string): void {
    this.router.navigate(['/notes/edit', id]);
  }

  getPreview(content: string): string {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent?.slice(0, 150) + '...' || '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}