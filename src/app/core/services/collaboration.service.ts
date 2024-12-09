import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ShareSettings, SharePermission, CollaborationUser } from '../models/share.model';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private ydoc = new Y.Doc();
  private wsProvider: WebsocketProvider | null = null;
  private shareSettingsSubject = new BehaviorSubject<ShareSettings[]>([]);
  private activeCollaboratorsSubject = new BehaviorSubject<CollaborationUser[]>([]);

  shareSettings$ = this.shareSettingsSubject.asObservable();
  activeCollaborators$ = this.activeCollaboratorsSubject.asObservable();

  constructor() {
    this.loadShareSettings();
    this.setupWebsocket();
  }

  private setupWebsocket(): void {
    this.wsProvider = new WebsocketProvider(
      'wss://your-collaboration-server.com',
      'productivity-hub',
      this.ydoc
    );

    this.wsProvider.on('status', (event: { status: 'connected' | 'disconnected' }) => {
      console.log('Collaboration status:', event.status);
    });

    this.wsProvider.awareness.on('change', () => {
      this.updateActiveCollaborators();
    });
  }

  private updateActiveCollaborators(): void {
    if (!this.wsProvider) return;

    const states = Array.from(this.wsProvider.awareness.getStates().entries());
    const collaborators: CollaborationUser[] = states.map(([clientId, state]) => ({
      id: clientId.toString(),
      email: state.user?.email || 'Anonymous',
      name: state.user?.name,
      color: state.user?.color || '#000000',
      cursor: state.cursor
    }));

    this.activeCollaboratorsSubject.next(collaborators);
  }

  shareResource(
    resourceId: string,
    resourceType: ShareSettings['resourceType'],
    email: string,
    permission: SharePermission
  ): void {
    const currentSettings = this.shareSettingsSubject.value;
    const existingShare = currentSettings.find(s => s.resourceId === resourceId);

    if (existingShare) {
      const updatedShare = {
        ...existingShare,
        sharedWith: [
          ...existingShare.sharedWith.filter(s => s.email !== email),
          { email, permission }
        ],
        updatedAt: new Date()
      };

      this.shareSettingsSubject.next(
        currentSettings.map(s => 
          s.id === existingShare.id ? updatedShare : s
        )
      );
    } else {
      const newShare: ShareSettings = {
        id: crypto.randomUUID(),
        resourceId,
        resourceType,
        sharedWith: [{ email, permission }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.shareSettingsSubject.next([...currentSettings, newShare]);
    }

    this.saveShareSettings();
  }

  removeShare(resourceId: string, email: string): void {
    const currentSettings = this.shareSettingsSubject.value;
    const updatedSettings = currentSettings.map(share => {
      if (share.resourceId === resourceId) {
        return {
          ...share,
          sharedWith: share.sharedWith.filter(s => s.email !== email),
          updatedAt: new Date()
        };
      }
      return share;
    });

    this.shareSettingsSubject.next(updatedSettings);
    this.saveShareSettings();
  }

  getResourceShares(resourceId: string): Observable<ShareSettings | undefined> {
    return this.shareSettings$.pipe(
      map(settings => settings.find(s => s.resourceId === resourceId))
    );
  }

  private loadShareSettings(): void {
    const savedSettings = localStorage.getItem('share-settings');
    if (savedSettings) {
      this.shareSettingsSubject.next(JSON.parse(savedSettings));
    }
  }

  private saveShareSettings(): void {
    localStorage.setItem('share-settings', 
      JSON.stringify(this.shareSettingsSubject.value)
    );
  }

  getYDoc(): Y.Doc {
    return this.ydoc;
  }

  disconnect(): void {
    this.wsProvider?.destroy();
  }
}