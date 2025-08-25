import { CalendarEvent } from '../../../types/calendar';

export interface CalendarRepository {
  getEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
}
