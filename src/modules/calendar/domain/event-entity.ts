import { CalendarEvent } from '../../../types/calendar';

export class Event implements CalendarEvent {
  constructor(
    public id: string,
    public title: string,
    public startTime: Date,
    public endTime: Date,
    public calendarId: string,
    public source: 'google' | 'microsoft',
    public description?: string,
    public location?: string,
    public attendees?: string[],
    public isAllDay: boolean = false,
  ) {}

  toString() {
    return `${this.title} (${this.startTime.toISOString()} - ${this.endTime.toISOString()})`;
  }
}
