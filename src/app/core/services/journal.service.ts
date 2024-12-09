import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { JournalEntry } from '../models/journal-entry.model';
import { FirebaseService } from './firebase.service';
import { DateUtils } from '../utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private entriesSubject = new BehaviorSubject<JournalEntry[]>([]);
  entries$ = this.entriesSubject.asObservable();
  private readonly COLLECTION_NAME = 'journal_entries';

  constructor(private firebaseService: FirebaseService) {
    this.loadEntries();
    // Subscribe to user changes to reload entries
    this.firebaseService.userId$.subscribe(() => {
      this.loadEntries();
    });
  }

  private async loadEntries(): Promise<void> {
    try {
      const entries = await this.firebaseService.getCollection<JournalEntry>(this.COLLECTION_NAME);
      this.entriesSubject.next(entries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      this.entriesSubject.next([]);
    }
  }

  async addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const newEntry: JournalEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.firebaseService.addDocument(this.COLLECTION_NAME, newEntry);
      await this.loadEntries();
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  }

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      await this.firebaseService.updateDocument(this.COLLECTION_NAME, id, updates);
      await this.loadEntries();
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      await this.firebaseService.deleteDocument(this.COLLECTION_NAME, id);
      await this.loadEntries();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  }

  getEntry(id: string): Observable<JournalEntry | undefined> {
    return this.entries$.pipe(
      map(entries => entries.find(entry => entry.id === id))
    );
  }

  getEntriesByDateRange(startDate: Date, endDate: Date): Observable<JournalEntry[]> {
    return this.entries$.pipe(
      map(entries => entries.filter(entry => {
        const entryDate = DateUtils.toDate(entry.createdAt);
        return entryDate && entryDate >= startDate && entryDate <= endDate;
      }))
    );
  }

  getEntriesByMood(mood: JournalEntry['mood']): Observable<JournalEntry[]> {
    return this.entries$.pipe(
      map(entries => entries.filter(entry => entry.mood === mood))
    );
  }

  getEntriesByDate(date: Date): Observable<JournalEntry[]> {
    return this.entries$.pipe(
      map(entries => entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.toDateString() === date.toDateString();
      }))
    );
  }

  searchEntries(query: string): Observable<JournalEntry[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.entries$.pipe(
      map(entries => entries.filter(entry => {
        const title = entry.title.toLowerCase();
        const content = entry.content.toLowerCase();
        const tags = entry.tags?.map(tag => tag.toLowerCase()) || [];
        return title.includes(lowercaseQuery) || 
               content.includes(lowercaseQuery) ||
               tags.some(tag => tag.includes(lowercaseQuery));
      }))
    );
  }
}