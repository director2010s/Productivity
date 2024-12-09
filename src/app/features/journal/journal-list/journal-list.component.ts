import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JournalService } from '../../../core/services/journal.service';
import { JournalEntry } from '../../../core/models/journal-entry.model';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-journal-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="journal-list">
      <div class="list-header">
        <h2>Journal Entries</h2>
        <button (click)="createNewEntry()" class="new-entry-button">
          New Entry
        </button>
      </div>

      <div class="search-filters">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch()"
          placeholder="Search entries..."
          class="search-input"
        >
        <div class="date-filters">
          <input
            type="date"
            [(ngModel)]="startDate"
            (ngModelChange)="onDateFilterChange()"
          >
          <span>to</span>
          <input
            type="date"
            [(ngModel)]="endDate"
            (ngModelChange)="onDateFilterChange()"
          >
        </div>
      </div>

      <div class="entries-list">
        <div *ngFor="let entry of filteredEntries$ | async" class="entry-card">
          <div class="entry-header">
            <h3>{{ entry.title }}</h3>
            <span class="entry-date">
              {{ formatDate(entry.createdAt) }}
            </span>
          </div>
          <div class="entry-preview" [innerHTML]="getPreview(entry.content)"></div>
          <div class="entry-footer">
            <div class="entry-tags">
              <span *ngFor="let tag of entry.tags" class="tag">
                {{ tag }}
              </span>
            </div>
            <div class="entry-actions">
              <button (click)="editEntry(entry)">Edit</button>
              <button (click)="deleteEntry(entry.id)" class="delete-button">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .journal-list {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .new-entry-button {
      padding: 0.5rem 1rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .search-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .date-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .entry-card {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .entry-date {
      font-size: 0.875rem;
      color: #666;
    }

    .entry-preview {
      margin: 0.5rem 0;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .entry-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .entry-tags {
      display: flex;
      gap: 0.5rem;
    }

    .tag {
      padding: 0.25rem 0.5rem;
      background: #e9ecef;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .entry-actions {
      display: flex;
      gap: 0.5rem;
    }

    .delete-button {
      background: #dc3545;
      color: white;
    }
  `]
})
export class JournalListComponent implements OnInit {
  searchQuery = '';
  startDate: string = '';
  endDate: string = '';
  filteredEntries$ = this.journalService.entries$;

  constructor(
    private journalService: JournalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.onSearch();
  }

  createNewEntry(): void {
    this.router.navigate(['/journal/new']);
  }

  editEntry(entry: JournalEntry): void {
    this.router.navigate(['/journal/edit', entry.id]);
  }

  deleteEntry(id: string): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.journalService.deleteEntry(id);
    }
  }

  onSearch(): void {
    if (this.searchQuery) {
      this.filteredEntries$ = this.journalService.searchEntries(this.searchQuery);
    } else {
      this.filteredEntries$ = this.journalService.entries$;
    }
  }

  onDateFilterChange(): void {
    if (this.startDate && this.endDate) {
      const start = DateUtils.toDate(this.startDate);
      const end = DateUtils.toDate(this.endDate);
      
      if (start && end) {
        this.filteredEntries$ = this.journalService.getEntriesByDateRange(start, end);
      }
    }
  }

  formatDate(date: any): string {
    return DateUtils.format(date);
  }

  getPreview(content: string): string {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent?.slice(0, 200) + '...' || '';
  }
}