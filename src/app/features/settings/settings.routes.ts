import { Routes } from '@angular/router';
import { NotificationPreferencesComponent } from './notification-preferences/notification-preferences.component';
import { ProfileComponent } from './profile/profile.component';

export const SETTINGS_ROUTES: Routes = [
  { path: 'notifications', component: NotificationPreferencesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];