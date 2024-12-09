import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Note } from '../models/note.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private notesSubject = new BehaviorSubject<Note[]>([]);
  notes$ = this.notesSubject.asObservable();
  private readonly COLLECTION_NAME = 'notes';

  constructor(private firebaseService: FirebaseService) {
    this.loadNotes();
    // Subscribe to user changes to reload notes
    this.firebaseService.userId$.subscribe(() => {
      this.loadNotes();
    });
  }

  private async loadNotes(): Promise<void> {
    try {
      const notes = await this.firebaseService.getCollection<Note>(this.COLLECTION_NAME);
      this.notesSubject.next(notes.sort((a, b) => {
        // Sort by pinned first, then by date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    } catch (error) {
      console.error('Error loading notes:', error);
      this.notesSubject.next([]);
    }
  }

  async addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      if (!note.title) {
        throw new Error('Note title is required');
      }

      const newNote: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.firebaseService.addDocument(this.COLLECTION_NAME, newNote);
      await this.loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error; // Re-throw to handle in the component
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    try {
      if (!id) {
        throw new Error('Note ID is required for update');
      }

      // Get the current note first
      const notes = this.notesSubject.getValue();
      const existingNote = notes.find(note => note.id === id);
      
      if (!existingNote) {
        throw new Error('Note not found');
      }

      const updatedNote = {
        ...existingNote,
        ...updates,
        updatedAt: new Date()
      };

      await this.firebaseService.updateDocument(this.COLLECTION_NAME, id, updatedNote);
      await this.loadNotes(); // Reload notes to get the latest state
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Note ID is required for deletion');
      }

      const notes = this.notesSubject.getValue();
      const noteExists = notes.some(note => note.id === id);
      
      if (!noteExists) {
        throw new Error('Note not found');
      }

      await this.firebaseService.deleteDocument(this.COLLECTION_NAME, id);
      await this.loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  searchNotes(query: string): Observable<Note[]> {
    return this.notes$.pipe(
      map(notes => {
        const searchTerm = query.toLowerCase();
        return notes.filter(note =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm) ||
          note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      })
    );
  }

  getNotesByTag(tag: string): Observable<Note[]> {
    return this.notes$.pipe(
      map(notes => notes.filter(note => 
        note.tags?.includes(tag)
      ))
    );
  }

  getNote(id: string): Observable<Note | undefined> {
    return this.notes$.pipe(
      map(notes => notes.find(note => note.id === id))
    );
  }
}