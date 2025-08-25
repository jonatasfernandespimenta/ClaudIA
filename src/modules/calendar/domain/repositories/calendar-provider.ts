import { CalendarEvent, CalendarInfo, TimeRange, CalendarProvider } from '../types/calendar-types';

export interface ICalendarProvider {
  readonly providerType: CalendarProvider;
  
  /**
   * Get all calendars for the user
   */
  getCalendars(): Promise<CalendarInfo[]>;
  
  /**
   * Get events from all calendars within a time range
   */
  getEvents(timeRange: TimeRange): Promise<CalendarEvent[]>;
  
  /**
   * Get events from specific calendars within a time range
   */
  getEventsFromCalendars(calendarIds: string[], timeRange: TimeRange): Promise<CalendarEvent[]>;
  
  /**
   * Get events for a specific day
   */
  getEventsForDay(date: Date): Promise<CalendarEvent[]>;
  
  /**
   * Get events for a specific week
   */
  getEventsForWeek(weekStartDate: Date): Promise<CalendarEvent[]>;
  
  /**
   * Find events that are occurring at a specific time
   */
  getEventsAtTime(dateTime: Date): Promise<CalendarEvent[]>;
  
  /**
   * Check if authenticated and ready to use
   */
  isAuthenticated(): Promise<boolean>;
}
