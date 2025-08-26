import { calendar_v3, auth, calendar } from '@googleapis/calendar';
import { OAuth2Client } from 'google-auth-library';
import { CalendarProvider, CalendarEvent, TimeSlot } from '../../../types/calendar';

export class GoogleCalendarAdapter implements CalendarProvider {
  private auth: OAuth2Client;

  private calendar: calendar_v3.Calendar;

  constructor() {
    this.auth = new auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    this.calendar = calendar({ version: 'v3', auth: this.auth });
  }

  async authenticate(): Promise<void> {
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error('Missing GOOGLE_REFRESH_TOKEN');
    }
    this.auth.setCredentials({ refresh_token: refreshToken });
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const res = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const items = res.data.items || [];
    return items.map((event) => ({
      id: event.id || '',
      title: event.summary || '',
      description: event.description || undefined,
      startTime: new Date(event.start?.dateTime || event.start?.date || ''),
      endTime: new Date(event.end?.dateTime || event.end?.date || ''),
      location: event.location || undefined,
      attendees: event.attendees?.map((a) => a.email || '').filter(Boolean),
      source: 'google',
      calendarId: event.organizer?.email || 'primary',
      isAllDay: !!event.start?.date && !event.start?.dateTime,
    }));
  }

  async findFreeTime(date: Date, duration: number): Promise<TimeSlot[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const res = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: 'primary' }],
      },
    });
    const busy = res.data.calendars?.primary?.busy || [];
    const slots: TimeSlot[] = [];
    let cursor = start;
    for (const period of busy) {
      const bStart = new Date(period.start!);
      const bEnd = new Date(period.end!);
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
