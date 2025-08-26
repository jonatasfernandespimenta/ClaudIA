import { PrismaClient } from '@prisma/client';
import { CalendarRepository } from '../domain/calendar-repository.interface';
import { CalendarEvent } from '../../../types/calendar';
import { logInfo, logError } from '../../../utils/logger';

export class PrismaCalendarRepository implements CalendarRepository {
  constructor(private prisma: PrismaClient) {}

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    logInfo('PrismaCalendarRepository', 'Finding calendar events', { 
      start: start.toISOString(), 
      end: end.toISOString() 
    });
    
    try {
      const events = await this.prisma.calendarEventCache.findMany({
        where: {
          AND: [
            { startTime: { gte: start } },
            { endTime: { lte: end } },
          ],
        },
      });
      
      logInfo('PrismaCalendarRepository', 'Calendar events retrieved successfully', { 
        count: events.length,
        dateRange: `${start.toISOString()} - ${end.toISOString()}`
      });
      
      return events.map((e: any) => ({
        id: e.eventId,
        title: e.title,
        description: e.description || undefined,
        startTime: e.startTime,
        endTime: e.endTime,
        location: undefined,
        attendees: undefined,
        source: e.source as 'google' | 'microsoft',
        calendarId: e.calendarId,
        isAllDay: e.isAllDay,
      }));
    } catch (error) {
      logError('PrismaCalendarRepository', 'Error retrieving calendar events', error as Error, { 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
      throw error;
    }
  }
}
