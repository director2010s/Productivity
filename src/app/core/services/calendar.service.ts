import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { CalendarEvent } from '../models/calendar-event.model';
import { FirebaseService } from './firebase.service';
import { DateUtils } from '../utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  events$ = this.eventsSubject.asObservable();
  private readonly COLLECTION_NAME = 'calendar_events';

  constructor(private firebaseService: FirebaseService) {
    this.loadEvents();
    // Subscribe to user changes to reload events
    this.firebaseService.userId$.subscribe(() => {
      this.loadEvents();
    });
  }

  private async loadEvents(): Promise<void> {
    try {
      const events = await this.firebaseService.getCollection<CalendarEvent>(this.COLLECTION_NAME);
      this.eventsSubject.next(events);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      this.eventsSubject.next([]);
    }
  }

  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const newEvent = {
        ...event,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.firebaseService.addDocument<CalendarEvent>(this.COLLECTION_NAME, newEvent);
      await this.loadEvents();
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    try {
      await this.firebaseService.updateDocument<CalendarEvent>(this.COLLECTION_NAME, id, updates);
      await this.loadEvents();
    } catch (error) {
      console.error('Error updating calendar event:', error);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await this.firebaseService.deleteDocument(this.COLLECTION_NAME, id);
      await this.loadEvents();
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  }

  getEventsByDateRange(startDate: Date, endDate: Date): Observable<CalendarEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(event => {
        const eventStart = DateUtils.toDate(event.start);
        const eventEnd = DateUtils.toDate(event.end);
        return eventStart && eventEnd && 
               eventStart >= startDate && eventEnd <= endDate;
      }))
    );
  }

  getUpcomingEvents(days: number = 7): Observable<CalendarEvent[]> {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);

    return this.events$.pipe(
      map(events => events.filter(event => {
        const eventStart = DateUtils.toDate(event.start);
        return eventStart && eventStart >= now && eventStart <= futureDate;
      }))
    );
  }

  getEventsForDay(date: Date): Observable<CalendarEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.events$.pipe(
      map(events => events.filter(event => {
        const eventStart = DateUtils.toDate(event.start);
        const eventEnd = DateUtils.toDate(event.end);
        return eventStart && eventEnd && 
               eventStart <= endOfDay && eventEnd >= startOfDay;
      }))
    );
  }

  getEventsForWeek(startDate: Date): Observable<CalendarEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(event => {
        const eventStart = event.start;
        const weekEndDate = new Date(startDate);
        weekEndDate.setDate(weekEndDate.getDate() + 7);
        return eventStart >= startDate && eventStart <= weekEndDate;
      }))
    );
  }
}