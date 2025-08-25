import { PrismaClient } from '@prisma/client';
import { CalendarRepository } from '../domain/calendar-repository.interface';
import { CalendarEvent } from '../../../types/calendar';

export class PrismaCalendarRepository implements CalendarRepository {
  constructor(private prisma: PrismaClient) {}

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    // TODO: Query cached events from database
    return [];
  }
}
