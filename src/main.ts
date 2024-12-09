import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { routes } from './app/app.routes';
import { UserMenuComponent } from './app/shared/components/user-menu/user-menu.component';
import { NotificationCenterComponent } from './app/shared/components/notification-center/notification-center.component';
import { ENVIRONMENT_CONFIG } from './app/core/config/environment.config';
import { environment } from './environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    UserMenuComponent,
    NotificationCenterComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-left">
          <h1>Productivity Hub</h1>
          <nav>
            <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
            <a routerLink="/notes" routerLinkActive="active">Notes</a>
            <a routerLink="/journal" routerLinkActive="active">Journal</a>
            <a routerLink="/calendar" routerLinkActive="active">Calendar</a>
            <a routerLink="/notifications" routerLinkActive="active">Notifications</a>
          </nav>
        </div>
        <div class="header-right">
          <app-user-menu></app-user-menu>
        </div>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: #f8f9fa;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    nav {
      display: flex;
      gap: 1rem;
    }

    nav a {
      color: #666;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    nav a.active {
      color: #007bff;
      background: rgba(0,123,255,0.1);
    }

    main {
      flex: 1;
      padding: 1rem;
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      nav {
        flex-wrap: wrap;
      }
    }
  `]
})
export class App {
  constructor() {}
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: ENVIRONMENT_CONFIG, useValue: environment }
  ]
});