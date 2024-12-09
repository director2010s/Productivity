import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'notes',
    loadChildren: () => import('./features/notes/notes.routes').then(m => m.NOTES_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'journal',
    loadChildren: () => import('./features/journal/journal.routes').then(m => m.JOURNAL_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.routes').then(m => m.CALENDAR_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/tasks', pathMatch: 'full' }
];