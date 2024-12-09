import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attachments-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attachments-area" *ngIf="attachments.length">
      <h3>Attachments</h3>
      <div class="attachments-list">
        <div *ngFor="let file of attachments" class="attachment">
          <span>{{ file.name }}</span>
          <button (click)="removeAttachment(file)" class="remove-attachment">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attachments-area {
      margin-top: 1rem;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .attachment {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .remove-attachment {
      border: none;
      background: none;
      color: #dc3545;
      cursor: pointer;
    }
  `]
})
export class AttachmentsListComponent {
  @Input() attachments: File[] = [];
  @Output() attachmentRemoved = new EventEmitter<File>();

  removeAttachment(file: File): void {
    this.attachmentRemoved.emit(file);
  }
}