import { PrismaClient } from '@prisma/client';
import { CalendarRepository } from '../domain/calendar-repository.interface';
import { CalendarEvent } from '../../../types/calendar';

export class PrismaCalendarRepository implements CalendarRepository {
  constructor(private prisma: PrismaClient) {}

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const events = await (this.prisma as any).calendarEventCache.findMany({
      where: {
        AND: [
          { startTime: { gte: start } },
          { endTime: { lte: end } },
        ],
      },
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
  }
}
