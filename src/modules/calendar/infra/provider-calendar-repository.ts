import { CalendarRepository } from '../domain/calendar-repository.interface';
import { CalendarProvider, CalendarEvent } from '../../../types/calendar';
import { logInfo, logError } from '../../../utils/logger';

export class ProviderCalendarRepository implements CalendarRepository {
  private authenticatedProviders = new Set<CalendarProvider>();

  constructor(private providers: CalendarProvider[]) {}

  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    logInfo('ProviderCalendarRepository', 'Fetching events from all providers', {
      start: start.toISOString(),
      end: end.toISOString(),
      providerCount: this.providers.length,
    });

    const allEvents: CalendarEvent[] = [];

    for (const provider of this.providers) {
      try {
        if (!this.authenticatedProviders.has(provider)) {
          await provider.authenticate();
          this.authenticatedProviders.add(provider);
        }
        const events = await provider.getEvents(start, end);
        allEvents.push(...events);
      } catch (error) {
        logError('ProviderCalendarRepository', 'Error fetching events from provider', error as Error, {
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }
    }

    allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    logInfo('ProviderCalendarRepository', 'Events fetched and combined successfully', {
      totalEvents: allEvents.length,
    });

    return allEvents;
  }
}
