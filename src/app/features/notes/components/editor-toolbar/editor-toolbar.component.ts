import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar">
      <button 
        (click)="onToggleBold()"
        [class.active]="editor?.isActive('bold')"
      >
        Bold
      </button>
      <button 
        (click)="onToggleItalic()"
        [class.active]="editor?.isActive('italic')"
      >
        Italic
      </button>
      <button 
        (click)="onToggleHeading(1)"
        [class.active]="editor?.isActive('heading', { level: 1 })"
      >
        H1
      </button>
      <button 
        (click)="onToggleHeading(2)"
        [class.active]="editor?.isActive('heading', { level: 2 })"
      >
        H2
      </button>
      <button 
        (click)="onToggleBulletList()"
        [class.active]="editor?.isActive('bulletList')"
      >
        Bullet List
      </button>
      <button 
        (click)="onToggleOrderedList()"
        [class.active]="editor?.isActive('orderedList')"
      >
        Numbered List
      </button>
      <label class="file-upload">
        📎 Add Image
        <input 
          type="file" 
          accept="image/*" 
          (change)="onImageSelected($event)"
          style="display: none"
        >
      </label>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
      flex-wrap: wrap;
    }

    .toolbar button {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .toolbar button.active {
      background: #e9ecef;
      border-color: #ced4da;
    }

    .file-upload {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class EditorToolbarComponent {
  @Input() editor: Editor | null = null;
  @Output() imageSelected = new EventEmitter<File>();

  onToggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  onToggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  onToggleHeading(level: 1 | 2): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  onToggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  onToggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.imageSelected.emit(input.files[0]);
    }
  }
}