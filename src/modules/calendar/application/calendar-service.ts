import { CalendarRepository } from '../domain/calendar-repository.interface';
import { CalendarEvent, TimeSlot } from '../../../types/calendar';
import { calculateTimeUsage, findFreeTimeSlots } from './event-queries';
import { logInfo, logError } from '../../../utils/logger';

export class CalendarService {
  constructor(private repository: CalendarRepository) {
    logInfo('CalendarService', 'Calendar service initialized');
  }

  async searchDayEvents(date: Date): Promise<CalendarEvent[]> {
    logInfo('CalendarService', 'Searching day events', { date: date.toISOString() });
    
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      
      const events = await this.repository.getEvents(start, end);
      
      logInfo('CalendarService', 'Day events search completed', { 
        date: date.toISOString(),
        eventCount: events.length
      });
      
      return events;
    } catch (error) {
      logError('CalendarService', 'Error searching day events', error as Error, { date: date.toISOString() });
      throw error;
    }
  }

  async searchWeekEvents(date: Date): Promise<CalendarEvent[]> {
    logInfo('CalendarService', 'Searching week events', { date: date.toISOString() });
    
    try {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      
      const events = await this.repository.getEvents(start, end);
      
      logInfo('CalendarService', 'Week events search completed', { 
        date: date.toISOString(),
        weekStart: start.toISOString(),
        weekEnd: end.toISOString(),
        eventCount: events.length
      });
      
      return events;
    } catch (error) {
      logError('CalendarService', 'Error searching week events', error as Error, { date: date.toISOString() });
      throw error;
    }
  }

  async searchMonthEvents(date: Date): Promise<CalendarEvent[]> {
    logInfo('CalendarService', 'Searching month events', { 
      year: date.getFullYear(), 
      month: date.getMonth() + 1
    });
    
    try {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const events = await this.repository.getEvents(start, end);
      
      logInfo('CalendarService', 'Month events search completed', { 
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        monthStart: start.toISOString(),
        monthEnd: end.toISOString(),
        eventCount: events.length
      });
      
      return events;
    } catch (error) {
      logError('CalendarService', 'Error searching month events', error as Error, { 
        year: date.getFullYear(), 
        month: date.getMonth() + 1
      });
      throw error;
    }
  }

  async searchEventsByTime(start: Date, end: Date): Promise<CalendarEvent[]> {
    logInfo('CalendarService', 'Searching events by time range', {
      start: start.toISOString(),
      end: end.toISOString()
    });
    
    try {
      const events = await this.repository.getEvents(start, end);
      
      logInfo('CalendarService', 'Events by time search completed', {
        start: start.toISOString(),
        end: end.toISOString(),
        eventCount: events.length
      });
      
      return events;
    } catch (error) {
      logError('CalendarService', 'Error searching events by time', error as Error, {
        start: start.toISOString(),
        end: end.toISOString()
      });
      throw error;
    }
  }

  async calculateTimeUsage(start: Date, end: Date): Promise<number> {
    logInfo('CalendarService', 'Calculating time usage', {
      start: start.toISOString(),
      end: end.toISOString()
    });
    
    try {
      const events = await this.repository.getEvents(start, end);
      const usage = calculateTimeUsage(events);
      
      logInfo('CalendarService', 'Time usage calculation completed', {
        start: start.toISOString(),
        end: end.toISOString(),
        eventCount: events.length,
        totalUsageMs: usage
      });
      
      return usage;
    } catch (error) {
      logError('CalendarService', 'Error calculating time usage', error as Error, {
        start: start.toISOString(),
        end: end.toISOString()
      });
      throw error;
    }
  }

  async findFreeTimeSlots(start: Date, end: Date): Promise<TimeSlot[]> {
    logInfo('CalendarService', 'Finding free time slots', {
      start: start.toISOString(),
      end: end.toISOString()
    });
    
    try {
      const events = await this.repository.getEvents(start, end);
      const freeSlots = findFreeTimeSlots(events, start, end);
      
      logInfo('CalendarService', 'Free time slots calculation completed', {
        start: start.toISOString(),
        end: end.toISOString(),
        eventCount: events.length,
        freeSlotCount: freeSlots.length
      });
      
      return freeSlots;
    } catch (error) {
      logError('CalendarService', 'Error finding free time slots', error as Error, {
        start: start.toISOString(),
        end: end.toISOString()
      });
      throw error;
    }
  }
}
