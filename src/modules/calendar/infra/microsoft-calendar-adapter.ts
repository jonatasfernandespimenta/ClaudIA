import { Client } from '@microsoft/microsoft-graph-client';
import { CalendarProvider, CalendarEvent, TimeSlot } from '../../../types/calendar';

export class MicrosoftCalendarAdapter implements CalendarProvider {
  private client: Client | null = null;

  async authenticate(): Promise<void> {
    const token = process.env.MS_GRAPH_TOKEN;
    if (!token) {
      throw new Error('Missing MS_GRAPH_TOKEN');
    }
    this.client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.client) {
      throw new Error('Client not authenticated');
    }
    const res = await this.client
      .api('/me/calendarview')
      .query({ startDateTime: startDate.toISOString(), endDateTime: endDate.toISOString() })
      .select('subject,body,start,end,location,attendees,isAllDay,organizer')
      .orderby('start/dateTime')
      .get();
    const items = res.value || [];
    return items.map((event: any) => ({
      id: event.id,
      title: event.subject || '',
      description: event.body?.content || undefined,
      startTime: new Date(event.start.dateTime),
      endTime: new Date(event.end.dateTime),
      location: event.location?.displayName || undefined,
      attendees: event.attendees?.map((a: any) => a.emailAddress?.address || '').filter(Boolean),
      source: 'microsoft',
      calendarId: event.organizer?.emailAddress?.address || '',
      isAllDay: event.isAllDay || false,
    }));
  }

  async findFreeTime(date: Date, duration: number): Promise<TimeSlot[]> {
    if (!this.client) {
      throw new Error('Client not authenticated');
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const res = await this.client.api('/me/calendar/getschedule').post({
      schedules: ['me'],
      startTime: { dateTime: start.toISOString(), timeZone: 'UTC' },
      endTime: { dateTime: end.toISOString(), timeZone: 'UTC' },
    });
    const busy = (res.value && res.value[0] && res.value[0].scheduleItems) || [];
    const slots: TimeSlot[] = [];
    let cursor = start;
    for (const item of busy) {
      const bStart = new Date(item.start.dateTime);
      const bEnd = new Date(item.end.dateTime);
      if (bStart.getTime() - cursor.getTime() >= duration) {
        slots.push({ start: new Date(cursor), end: new Date(bStart) });
      }
      if (bEnd > cursor) {
        cursor = new Date(bEnd);
      }
    }
    if (end.getTime() - cursor.getTime() >= duration) {
      slots.push({ start: new Date(cursor), end: new Date(end) });
    }
    return slots;
  }
}
