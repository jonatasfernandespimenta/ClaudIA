import { CalendarEvent, CalendarInfo, TimeRange, DayEventsSummary, WeekEventsSummary, EventDuration } from '../types/calendar-types';

export interface CalendarRepository {
  /**
   * Get all calendars from all providers
   */
  getAllCalendars(): Promise<CalendarInfo[]>;
  
  /**
   * Get events for a specific day across all providers
   */
  getEventsForDay(date: Date): Promise<CalendarEvent[]>;
  
  /**
   * Get events for a specific week across all providers
   */
  getEventsForWeek(weekStartDate: Date): Promise<CalendarEvent[]>;
  
  /**
   * Get events within a specific time range
   */
  getEventsInTimeRange(timeRange: TimeRange): Promise<CalendarEvent[]>;
  
  /**
   * Get events that are occurring at a specific time
   */
  getEventsAtTime(dateTime: Date): Promise<CalendarEvent[]>;
  
  /**
   * Get events summary for a specific day
   */
  getDayEventsSummary(date: Date): Promise<DayEventsSummary>;
  
  /**
   * Get events summary for a specific week
   */
  getWeekEventsSummary(weekStartDate: Date): Promise<WeekEventsSummary>;
  
  /**
   * Calculate total duration of events in a day
   */
  calculateDayDuration(date: Date): Promise<EventDuration>;
  
  /**
   * Calculate total duration of events in a week
   */
  calculateWeekDuration(weekStartDate: Date): Promise<EventDuration>;
}
