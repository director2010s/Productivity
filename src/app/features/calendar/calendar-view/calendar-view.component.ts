import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarService } from '../../../core/services/calendar.service';
import { CalendarEvent } from '../../../core/models/calendar-event.model';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <h2>Calendar</h2>
        <button (click)="createEvent()" class="new-event-button">
          New Event
        </button>
      </div>

      <full-calendar
        [options]="calendarOptions"
        class="calendar-view"
      ></full-calendar>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 1rem;
      height: calc(100vh - 4rem);
      display: flex;
      flex-direction: column;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .new-event-button {
      padding: 0.5rem 1rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .calendar-view {
      flex: 1;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    :host ::ng-deep {
      .fc {
        height: 100%;
      }

      .fc-toolbar-title {
        font-size: 1.25rem !important;
      }

      .fc-event {
        cursor: pointer;
      }

      .fc-event-main {
        padding: 0.25rem;
      }

      .fc-day-today {
        background: #f8f9fa !important;
      }
    }
  `]
})
export class CalendarViewComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventChange: this.handleEventChange.bind(this),
    events: []
  };

  constructor(
    private calendarService: CalendarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.calendarService.events$.subscribe(events => {
      this.calendarOptions.events = events.map(event => ({
        ...event,
        color: event.color || '#3788d8'
      }));
    });
  }

  createEvent(): void {
    this.router.navigate(['/calendar/new']);
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'New Event',
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay
    };

    this.calendarService.addEvent(event);
  }

  handleEventClick(clickInfo: EventClickArg): void {
    this.router.navigate(['/calendar/edit', clickInfo.event.id]);
  }

  handleEventChange(changeInfo: any): void {
    this.calendarService.updateEvent(changeInfo.event.id, {
      start: changeInfo.event.start,
      end: changeInfo.event.end,
      allDay: changeInfo.event.allDay
    });
  }
}