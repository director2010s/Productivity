import { Routes } from '@angular/router';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { EventEditorComponent } from './event-editor/event-editor.component';

export const CALENDAR_ROUTES: Routes = [
  { path: '', component: CalendarViewComponent },
  { path: 'new', component: EventEditorComponent },
  { path: 'edit/:id', component: EventEditorComponent }
];