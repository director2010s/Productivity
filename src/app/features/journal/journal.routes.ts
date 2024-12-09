import { Routes } from '@angular/router';
import { JournalListComponent } from './journal-list/journal-list.component';
import { JournalEditorComponent } from './journal-editor/journal-editor.component';

export const JOURNAL_ROUTES: Routes = [
  { path: '', component: JournalListComponent },
  { path: 'new', component: JournalEditorComponent },
  { path: 'edit/:id', component: JournalEditorComponent }
];