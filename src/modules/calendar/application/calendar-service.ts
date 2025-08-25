import { CalendarRepository } from '../domain/calendar-repository.interface';
import { CalendarEvent, TimeSlot } from '../../../types/calendar';
import { calculateTimeUsage, findFreeTimeSlots } from './event-queries';

export class CalendarService {
  constructor(private repository: CalendarRepository) {}

  async searchDayEvents(date: Date): Promise<CalendarEvent[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.repository.getEvents(start, end);
  }

  async searchWeekEvents(date: Date): Promise<CalendarEvent[]> {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return this.repository.getEvents(start, end);
  }

  async searchMonthEvents(date: Date): Promise<CalendarEvent[]> {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return this.repository.getEvents(start, end);
  }

  async searchEventsByTime(start: Date, end: Date): Promise<CalendarEvent[]> {
    return this.repository.getEvents(start, end);
  }

  async calculateTimeUsage(start: Date, end: Date): Promise<number> {
    const events = await this.repository.getEvents(start, end);
    return calculateTimeUsage(events);
  }

  async findFreeTimeSlots(start: Date, end: Date): Promise<TimeSlot[]> {
    const events = await this.repository.getEvents(start, end);
    return findFreeTimeSlots(events, start, end);
  }
}
