import { Client } from '@microsoft/microsoft-graph-client';
import { fromZonedTime } from 'date-fns-tz';
import { CalendarProvider, CalendarEvent, TimeSlot } from '../../../types/calendar';
import { logInfo, logError, logWarn } from '../../../utils/logger';
import { getMicrosoftTokenService } from '../../../services/microsoft-token-service';

export class MicrosoftCalendarAdapter implements CalendarProvider {
  private client: Client | null = null;
  private tokenService = getMicrosoftTokenService();
  
  constructor() {
    logInfo('MicrosoftCalendarAdapter', 'Initializing Microsoft Calendar adapter');
  }

  async authenticate(): Promise<void> {
    logInfo('MicrosoftCalendarAdapter', 'Starting Microsoft Graph authentication');
    
    try {
      // Usa o token service para obter um token válido (renovado automaticamente se necessário)
      this.client = Client.init({
        authProvider: async (done) => {
          try {
            const token = await this.tokenService.getValidToken();
            done(null, token);
          } catch (error) {
            logError('MicrosoftCalendarAdapter', 'Failed to get valid token', error as Error);
            done(error as Error, null);
          }
        },
      });
      
      logInfo('MicrosoftCalendarAdapter', 'Microsoft Graph authentication completed successfully');
    } catch (error) {
      logError('MicrosoftCalendarAdapter', 'Error during Microsoft Graph authentication', error as Error);
      throw error;
    }
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    logInfo('MicrosoftCalendarAdapter', 'Fetching Microsoft Calendar events', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    try {
      if (!this.client) {
        logError('MicrosoftCalendarAdapter', 'Microsoft Graph client not authenticated');
        throw new Error('Client not authenticated');
      }
      
      const userEmail = process.env.MS_GRAPH_USER_EMAIL;
      const calendarPath = userEmail ? `/users/${userEmail}/calendarview` : '/me/calendarview';
      const res = await this.client
        .api(calendarPath)
        .query({ startDateTime: startDate.toISOString(), endDateTime: endDate.toISOString() })
        .select('subject,body,start,end,location,attendees,isAllDay,organizer')
        .orderby('start/dateTime')
        .get();
        
      const items = res.value || [];
      logInfo('MicrosoftCalendarAdapter', 'Microsoft Calendar events fetched successfully', {
        eventCount: items.length,
        dateRange: `${startDate.toISOString()} - ${endDate.toISOString()}`
      });
      
      const events = items.map((event: any) => {
        // Microsoft Calendar retorna data/hora com fuso separado.
        // Converter explicitamente usando o timezone informado para evitar offsets incorretos.
        const startTime = fromZonedTime(
          event.start.dateTime,
          event.start.timeZone || 'UTC'
        );
        const endTime = fromZonedTime(
          event.end.dateTime,
          event.end.timeZone || 'UTC'
        );
        
        return {
          id: event.id,
          title: event.subject || '',
          description: event.body?.content || undefined,
          startTime,
          endTime,
          location: event.location?.displayName || undefined,
          attendees: event.attendees?.map((a: any) => a.emailAddress?.address || '').filter(Boolean),
          source: 'microsoft' as 'microsoft',
          calendarId: event.organizer?.emailAddress?.address || '',
          isAllDay: event.isAllDay || false,
        };
      });
      
      logInfo('MicrosoftCalendarAdapter', 'Microsoft Calendar events processed successfully', {
        processedEventCount: events.length
      });
      
      return events;
    } catch (error) {
      logError('MicrosoftCalendarAdapter', 'Error fetching Microsoft Calendar events', error as Error, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }

  async findFreeTime(date: Date, duration: number): Promise<TimeSlot[]> {
    logInfo('MicrosoftCalendarAdapter', 'Finding free time slots in Microsoft Calendar', {
      date: date.toISOString(),
      durationMs: duration
    });
    
    try {
      if (!this.client) {
        logError('MicrosoftCalendarAdapter', 'Microsoft Graph client not authenticated');
        throw new Error('Client not authenticated');
      }
      
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      
      logInfo('MicrosoftCalendarAdapter', 'Querying Microsoft Graph getSchedule API', {
        timeRange: `${start.toISOString()} - ${end.toISOString()}`
      });
      
      const userEmail = process.env.MS_GRAPH_USER_EMAIL;
      const schedulePath = userEmail ? `/users/${userEmail}/calendar/getschedule` : '/me/calendar/getschedule';
      const res = await this.client.api(schedulePath).post({
        schedules: [userEmail || 'me'],
        startTime: { dateTime: start.toISOString(), timeZone: 'UTC' },
        endTime: { dateTime: end.toISOString(), timeZone: 'UTC' },
      });
      
      const busy = (res.value && res.value[0] && res.value[0].scheduleItems) || [];
      logInfo('MicrosoftCalendarAdapter', 'Schedule data retrieved from Microsoft Graph', {
        busyPeriodsCount: busy.length
      });
      
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
      
      logInfo('MicrosoftCalendarAdapter', 'Free time slots calculated successfully', {
        freeSlotCount: slots.length,
        date: date.toISOString()
      });
      
      return slots;
    } catch (error) {
      logError('MicrosoftCalendarAdapter', 'Error finding free time in Microsoft Calendar', error as Error, {
        date: date.toISOString(),
        duration
      });
      throw error;
    }
  }
}
