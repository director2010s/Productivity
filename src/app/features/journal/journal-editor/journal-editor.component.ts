import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { JournalService } from '../../../core/services/journal.service';
import { TagsInputComponent } from '../../../shared/components/tags-input/tags-input.component';
import { EditorToolbarComponent } from '../../notes/components/editor-toolbar/editor-toolbar.component';
import { JournalEntry } from '../../../core/models/journal-entry.model';

@Component({
  selector: 'app-journal-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagsInputComponent,
    EditorToolbarComponent
  ],
  template: `
    <div class="journal-editor">
      <div class="editor-header">
        <input
          type="text"
          [(ngModel)]="entryTitle"
          placeholder="Title your entry..."
          class="title-input"
        >
        <div class="mood-selector">
          <label>How are you feeling?</label>
          <select [(ngModel)]="selectedMood">
            <option value="">Select mood</option>
            <option value="happy">😊 Happy</option>
            <option value="excited">🎉 Excited</option>
            <option value="neutral">😐 Neutral</option>
            <option value="anxious">😰 Anxious</option>
            <option value="sad">😢 Sad</option>
          </select>
        </div>
      </div>

      <app-tags-input
        [tags]="tags"
        (tagsChange)="handleTagsChange($event)"
      ></app-tags-input>

      <app-editor-toolbar [editor]="editor"></app-editor-toolbar>

      <div #editorElement class="content-editor"></div>

      <div class="entry-footer">
        <label class="privacy-toggle">
          <input
            type="checkbox"
            [(ngModel)]="isPrivate"
          >
          Make this entry private
        </label>
        <button (click)="saveEntry()" class="save-button">Save Entry</button>
      </div>
    </div>
  `,
  styles: [`
    .journal-editor {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .editor-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .title-input {
      flex: 1;
      font-size: 1.5rem;
      padding: 0.5rem;
      border: none;
      border-bottom: 2px solid #eee;
    }

    .mood-selector {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mood-selector select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .content-editor {
      margin-top: 1rem;
      padding: 1rem;
      min-height: 300px;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .entry-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .privacy-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .save-button {
      padding: 0.5rem 1rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .save-button:hover {
      background: #218838;
    }
  `]
})
export class JournalEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorElement') editorElement!: ElementRef;

  editor: Editor | null = null;
  entryTitle = '';
  selectedMood: JournalEntry['mood'];
  tags: string[] = [];
  isPrivate = false;
  isEditing = false;
  entryId: string | null = null;

  constructor(
    private journalService: JournalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkForExistingEntry();
  }

  ngAfterViewInit() {
    // Initialize editor after view is ready
    setTimeout(() => {
      this.initEditor();
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private checkForExistingEntry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.entryId = id;
      this.journalService.getEntry(id).subscribe(entry => {
        if (entry) {
          this.entryTitle = entry.title;
          this.selectedMood = entry.mood;
          this.tags = entry.tags || [];
          this.isPrivate = entry.isPrivate;
          // Wait for editor to be initialized before setting content
          if (this.editor) {
            this.editor.commands.setContent(entry.content);
          }
        }
      });
    }
  }

  private initEditor() {
    if (!this.editorElement) {
      console.warn('Editor element not found');
      return;
    }

    this.editor = new Editor({
      element: this.editorElement.nativeElement,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: 'Write your thoughts...'
        })
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none'
        }
      }
    });
  }

  handleTagsChange(newTags: string[]): void {
    this.tags = newTags;
  }

  saveEntry(): void {
    if (!this.entryTitle || !this.editor) return;

    const entry = {
      title: this.entryTitle,
      content: this.editor.getHTML(),
      mood: this.selectedMood,
      tags: this.tags,
      isPrivate: this.isPrivate
    };

    if (this.isEditing && this.entryId) {
      this.journalService.updateEntry(this.entryId, entry);
    } else {
      this.journalService.addEntry(entry);
    }

    this.router.navigate(['/journal']);
  }
}