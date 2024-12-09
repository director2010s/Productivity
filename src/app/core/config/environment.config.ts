import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface EnvironmentConfig {
  production: boolean;
  openai: {
    apiKey: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('ENVIRONMENT_CONFIG', {
  providedIn: 'root',
  factory: () => environment
});