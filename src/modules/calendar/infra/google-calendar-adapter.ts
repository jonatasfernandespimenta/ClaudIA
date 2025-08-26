import { calendar_v3, auth, calendar } from '@googleapis/calendar';
import { OAuth2Client } from 'google-auth-library';
import { CalendarProvider, CalendarEvent, TimeSlot } from '../../../types/calendar';
import { logInfo, logError, logWarn } from '../../../utils/logger';

export class GoogleCalendarAdapter implements CalendarProvider {
  private auth: OAuth2Client;

  private calendar: calendar_v3.Calendar;

  constructor() {
    logInfo('GoogleCalendarAdapter', 'Initializing Google Calendar adapter');
    
    this.auth = new auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    this.calendar = calendar({ version: 'v3', auth: this.auth });
    
    logInfo('GoogleCalendarAdapter', 'Google Calendar adapter initialized successfully');
  }

  async authenticate(): Promise<void> {
    logInfo('GoogleCalendarAdapter', 'Starting Google Calendar authentication');
    
    try {
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      if (!refreshToken) {
        logError('GoogleCalendarAdapter', 'Missing GOOGLE_REFRESH_TOKEN environment variable');
        throw new Error('Missing GOOGLE_REFRESH_TOKEN');
      }
      
      this.auth.setCredentials({ refresh_token: refreshToken });
      logInfo('GoogleCalendarAdapter', 'Google Calendar authentication completed successfully');
    } catch (error) {
      logError('GoogleCalendarAdapter', 'Error during Google Calendar authentication', error as Error);
      throw error;
    }
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    logInfo('GoogleCalendarAdapter', 'Fetching Google Calendar events', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    try {
      const res = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      const items = res.data.items || [];
      logInfo('GoogleCalendarAdapter', 'Google Calendar events fetched successfully', {
        eventCount: items.length,
        dateRange: `${startDate.toISOString()} - ${endDate.toISOString()}`
      });
      
      const events = items.map((event) => {
        // Google Calendar já retorna datas no timezone correto
        // Não precisamos converter novamente se já estamos no timezone brasileiro
        const isAllDay = !!event.start?.date && !event.start?.dateTime;
        
        const startTime = new Date(event.start?.dateTime || event.start?.date || '');
        const endTime = new Date(event.end?.dateTime || event.end?.date || '');
        
        return {
          id: event.id || '',
          title: event.summary || '',
          description: event.description || undefined,
          startTime,
          endTime,
          location: event.location || undefined,
          attendees: event.attendees?.map((a) => a.email || '').filter(Boolean),
          source: 'google' as 'google',
          calendarId: event.organizer?.email || 'primary',
          isAllDay,
        };
      });
      
      logInfo('GoogleCalendarAdapter', 'Google Calendar events processed successfully', {
        processedEventCount: events.length
      });
      
      return events;
    } catch (error) {
      logError('GoogleCalendarAdapter', 'Error fetching Google Calendar events', error as Error, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }

  async findFreeTime(date: Date, duration: number): Promise<TimeSlot[]> {
    logInfo('GoogleCalendarAdapter', 'Finding free time slots in Google Calendar', {
      date: date.toISOString(),
      durationMs: duration
    });
    
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      
      logInfo('GoogleCalendarAdapter', 'Querying Google Calendar freebusy', {
        timeRange: `${start.toISOString()} - ${end.toISOString()}`
      });
      
      const res = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          items: [{ id: 'primary' }],
        },
      });
      
      const busy = res.data.calendars?.primary?.busy || [];
      logInfo('GoogleCalendarAdapter', 'Freebusy data retrieved from Google Calendar', {
        busyPeriodsCount: busy.length
      });
      
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
      
      logInfo('GoogleCalendarAdapter', 'Free time slots calculated successfully', {
        freeSlotCount: slots.length,
        date: date.toISOString()
      });
      
      return slots;
    } catch (error) {
      logError('GoogleCalendarAdapter', 'Error finding free time in Google Calendar', error as Error, {
        date: date.toISOString(),
        duration
      });
      throw error;
    }
  }
}
