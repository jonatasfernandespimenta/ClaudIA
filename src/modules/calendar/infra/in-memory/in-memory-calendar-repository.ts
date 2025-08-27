import { CalendarEvent } from '../../../../types/calendar';
import { CalendarRepository } from '../../domain/calendar-repository.interface';
import { Event } from '../../domain/event-entity';

export class InMemoryCalendarRepository implements CalendarRepository {
  private events: Map<string, Event> = new Map();

  constructor(initialEvents: Event[] = []) {
    initialEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const events = Array.from(this.events.values())
      .filter(event => {
        // Event overlaps with the requested time range
        return event.startTime < end && event.endTime > start;
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return Promise.resolve(events);
  }

  // Additional methods for testing convenience
  async save(event: Event): Promise<Event> {
    this.events.set(event.id, event);
    return Promise.resolve(event);
  }

  async findById(id: string): Promise<Event | null> {
    const event = this.events.get(id);
    return Promise.resolve(event || null);
  }

  async findAll(): Promise<Event[]> {
    const events = Array.from(this.events.values());
    return Promise.resolve(
      events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    );
  }

  async delete(id: string): Promise<boolean> {
    return Promise.resolve(this.events.delete(id));
  }

  clear(): void {
    this.events.clear();
  }

  size(): number {
    return this.events.size;
  }

  async findByCalendarId(calendarId: string): Promise<Event[]> {
    const events = Array.from(this.events.values())
      .filter(event => event.calendarId === calendarId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return Promise.resolve(events);
  }

  async findBySource(source: 'google' | 'microsoft'): Promise<Event[]> {
    const events = Array.from(this.events.values())
      .filter(event => event.source === source)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return Promise.resolve(events);
  }

  async findEventsForDay(date: Date): Promise<Event[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getEvents(startOfDay, endOfDay) as Promise<Event[]>;
  }

  async findUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const now = new Date();
    const events = Array.from(this.events.values())
      .filter(event => event.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, limit);

    return Promise.resolve(events);
  }

  async findAllDayEvents(date: Date): Promise<Event[]> {
    const events = Array.from(this.events.values())
      .filter(event => {
        const eventDate = new Date(event.startTime);
        return event.isAllDay && 
               eventDate.toDateString() === date.toDateString();
      });

    return Promise.resolve(events);
  }

  async searchEventsByTitle(searchTerm: string): Promise<Event[]> {
    const events = Array.from(this.events.values())
      .filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return Promise.resolve(events);
  }
}
