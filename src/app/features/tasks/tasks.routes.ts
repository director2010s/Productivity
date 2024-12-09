import { Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';

export const TASKS_ROUTES: Routes = [
  { path: '', component: TaskListComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];