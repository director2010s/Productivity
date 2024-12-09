import { Routes } from '@angular/router';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';

export const NOTES_ROUTES: Routes = [
  { path: '', component: NoteListComponent },
  { path: 'new', component: NoteEditorComponent },
  { path: 'edit/:id', component: NoteEditorComponent }
];