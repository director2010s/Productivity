import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tags-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tags-input">
      <input
        type="text"
        [(ngModel)]="tagInput"
        placeholder="Add tags..."
        (keydown.enter)="addTag()"
      >
      <div class="tags-list">
        <span *ngFor="let tag of tags" class="tag">
          {{ tag }}
          <button (click)="removeTag(tag)" class="remove-tag">×</button>
        </span>
      </div>
    </div>
  `,
  styles: [`
    .tags-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: #e9ecef;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .remove-tag {
      border: none;
      background: none;
      color: #6c757d;
      cursor: pointer;
      padding: 0 0.25rem;
    }
  `]
})
export class TagsInputComponent {
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  tagInput = '';

  addTag(): void {
    if (this.tagInput.trim()) {
      const updatedTags = [...this.tags, this.tagInput.trim()];
      this.tagsChange.emit(updatedTags);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    const updatedTags = this.tags.filter(t => t !== tag);
    this.tagsChange.emit(updatedTags);
  }
}