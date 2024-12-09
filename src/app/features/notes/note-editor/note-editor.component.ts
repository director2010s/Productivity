import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { VoiceRecorderComponent } from '../../../shared/components/voice-recorder/voice-recorder.component';
import { EditorToolbarComponent } from '../components/editor-toolbar/editor-toolbar.component';
import { TagsInputComponent } from '../components/tags-input/tags-input.component';
import { AttachmentsListComponent } from '../components/attachments-list/attachments-list.component';
import { NoteService } from '../../../core/services/note.service';
import { SpeechRecognitionService } from '../../../core/services/speech-recognition.service';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VoiceRecorderComponent,
    EditorToolbarComponent,
    TagsInputComponent,
    AttachmentsListComponent
  ],
  template: `
    <div class="note-editor">
      <app-editor-toolbar
        [editor]="editor"
        (imageSelected)="handleImageSelected($event)"
      ></app-editor-toolbar>

      <div class="editor-content">
        <input
          type="text"
          [(ngModel)]="noteTitle"
          placeholder="Note title..."
          class="title-input"
        >

        <app-tags-input
          [tags]="tags"
          (tagsChange)="handleTagsChange($event)"
        ></app-tags-input>

        <app-voice-recorder
          [autoSave]="true"
          (transcriptionComplete)="onTranscriptionComplete($event)"
        ></app-voice-recorder>

        <div #editorElement class="content-editor"></div>

        <app-attachments-list
          [attachments]="attachments"
          (attachmentRemoved)="handleAttachmentRemoved($event)"
        ></app-attachments-list>
      </div>

      <div class="actions">
        <button (click)="saveNote()" class="save-button">Save Note</button>
      </div>
    </div>
  `,
  styles: [`
    .note-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
      gap: 1rem;
    }

    .editor-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .title-input {
      font-size: 1.5rem;
      padding: 0.5rem;
      border: none;
      border-bottom: 2px solid #eee;
    }

    .content-editor {
      flex: 1;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
      min-height: 300px;
      overflow-y: auto;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #eee;
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
export class NoteEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorElement') editorElement!: ElementRef;

  editor: Editor | null = null;
  noteTitle = '';
  tags: string[] = [];
  attachments: File[] = [];
  editingNoteId: string | null = null;

  constructor(
    private noteService: NoteService,
    private speechService: SpeechRecognitionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.speechService.transcript$.subscribe(transcript => {
      if (transcript && this.editor) {
        this.editor.commands.insertContent(transcript);
      }
    });

    // Check if we're editing an existing note
    const noteId = this.route.snapshot.params['id'];
    if (noteId) {
      this.loadExistingNote(noteId);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initEditor();
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
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
        Image
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none'
        }
      }
    });
  }

  private async loadExistingNote(noteId: string) {
    try {
      const notes = await firstValueFrom(this.noteService.notes$.pipe(take(1)));
      const note = notes.find(n => n.id === noteId);
      
      if (note) {
        this.editingNoteId = noteId;
        this.noteTitle = note.title;
        this.tags = note.tags || [];
        // We'll set the content after the editor is initialized
        setTimeout(() => {
          if (this.editor && note.content) {
            this.editor.commands.setContent(note.content);
          }
        }, 0);
      } else {
        console.error('Note not found');
        await this.router.navigate(['/notes']);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      await this.router.navigate(['/notes']);
    }
  }

  handleImageSelected(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.editor?.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
    this.attachments.push(file);
  }

  handleTagsChange(newTags: string[]): void {
    this.tags = newTags;
  }

  handleAttachmentRemoved(file: File): void {
    this.attachments = this.attachments.filter(f => f !== file);
  }

  onTranscriptionComplete(transcript: string): void {
    if (this.editor) {
      this.editor.commands.insertContent(transcript);
    }
  }

  async saveNote(): Promise<void> {
    if (!this.noteTitle?.trim()) {
      alert('Please enter a note title');
      return;
    }

    if (!this.editor) {
      alert('Editor is not initialized');
      return;
    }

    try {
      const noteData = {
        title: this.noteTitle.trim(),
        content: this.editor.getHTML() || '',
        tags: this.tags || [],
        attachments: this.attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })),
        voiceTranscription: false,
        isArchived: false,
        isPinned: false
      };

      if (this.editingNoteId) {
        await this.noteService.updateNote(this.editingNoteId, noteData);
      } else {
        await this.noteService.addNote(noteData);
      }

      console.log(`Note ${this.editingNoteId ? 'updated' : 'saved'} successfully`);
      this.resetEditor();
      await this.router.navigate(['/notes']);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  }

  private resetEditor(): void {
    this.noteTitle = '';
    this.tags = [];
    this.attachments = [];
    if (this.editor) {
      this.editor.commands.setContent('');
    }
  }
}