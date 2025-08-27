import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  searchDayEventsSchema,
  searchWeekEventsSchema,
  searchMonthEventsSchema,
  searchEventsByTimeSchema,
  calculateTimeUsageSchema,
  findFreeTimeSlotsSchema,
  visualizeCalendarBoardSchema,
} from './calendar-schemas';
import { logInfo, logError } from '../../utils/logger';
import { PremiumCalendarFormatter } from '../../utils/premium-calendar-formatter';
import { CalendarBoardVisualizer } from '../../utils/calendar-board-visualizer';

import { CalendarRepository } from '../../modules/calendar/domain/calendar-repository.interface';
import { CalendarService } from '../../modules/calendar/application/calendar-service';
import { ProviderCalendarRepository } from '../../modules/calendar/infra/provider-calendar-repository';
import { GoogleCalendarAdapter } from '../../modules/calendar/infra/google-calendar-adapter';
import { MicrosoftCalendarAdapter } from '../../modules/calendar/infra/microsoft-calendar-adapter';
import { formatInBrazilTimezone } from '../../utils/timezone';
import { CalendarEvent, TimeSlot } from '../../types/calendar';

const providers = [new GoogleCalendarAdapter(), new MicrosoftCalendarAdapter()];
const calendarRepository: CalendarRepository = new ProviderCalendarRepository(providers);
const calendarService = new CalendarService(calendarRepository);

function formatEventTimes(events: CalendarEvent[]) {
  return events.map((event) => ({
    ...event,
    startTime: formatInBrazilTimezone(event.startTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    endTime: formatInBrazilTimezone(event.endTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }));
}

function formatSlotTimes(slots: TimeSlot[]) {
  return slots.map((slot) => ({
    start: formatInBrazilTimezone(slot.start, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    end: formatInBrazilTimezone(slot.end, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }));
}

export const searchDayEventsTool = tool(
  async (input) => {
    const { date } = input as z.infer<typeof searchDayEventsSchema>;
    logInfo('CalendarTool', 'Searching day events via tool', { date });
    
    try {
      const events = await calendarService.searchDayEvents(new Date(date));
      logInfo('CalendarTool', 'Day events found successfully', {
        date,
        eventCount: events.length
      });
      
      // Usar formatador premium para display elegante
      const premiumDisplay = PremiumCalendarFormatter.formatDayEvents(events, new Date(date));
      return premiumDisplay;
    } catch (error) {
      logError('CalendarTool', 'Error searching day events via tool', error as Error, { date });
      throw error;
    }
  },
  {
    name: 'search_day_events',
    description: 'Search and retrieve calendar events for a specific day, returning complete event information including exact titles, times, descriptions, locations, and attendees from Google Calendar, Microsoft Calendar, or other connected sources with premium visual formatting',
    schema: searchDayEventsSchema,
  },
);

export const searchWeekEventsTool = tool(
  async (input) => {
    const { date } = input as z.infer<typeof searchWeekEventsSchema>;
    const events = await calendarService.searchWeekEvents(new Date(date));
    
    // Usar formatador premium para display elegante
    const premiumDisplay = PremiumCalendarFormatter.formatWeekEvents(events);
    return premiumDisplay;
  },
  {
    name: 'search_week_events',
    description: 'Search and retrieve calendar events for an entire week, returning complete event information including exact titles, times, descriptions, locations, and attendees from all connected calendar sources with premium visual formatting',
    schema: searchWeekEventsSchema,
  },
);

export const searchMonthEventsTool = tool(
  async (input) => {
    const { month, year } = input as z.infer<typeof searchMonthEventsSchema>;
    const events = await calendarService.searchMonthEvents(new Date(year, month - 1, 1));
    const formatted = formatEventTimes(events);
    return JSON.stringify(formatted, null, 2);
  },
  {
    name: 'search_month_events',
    description: 'Search and retrieve calendar events for an entire month, returning complete event information including exact titles, times, descriptions, locations, and attendees from all connected calendar sources',
    schema: searchMonthEventsSchema,
  },
);

export const searchEventsByTimeTool = tool(
  async (input) => {
    const { start, end } = input as z.infer<typeof searchEventsByTimeSchema>;
    const events = await calendarService.searchEventsByTime(new Date(start), new Date(end));
    const formatted = formatEventTimes(events);
    return JSON.stringify(formatted, null, 2);
  },
  {
    name: 'search_events_by_time',
    description: 'Search and retrieve calendar events within a custom time range, returning complete event information including exact titles, times, descriptions, locations, and attendees from all connected calendar sources',
    schema: searchEventsByTimeSchema,
  },
);

export const calculateTimeUsageTool = tool(
  async (input) => {
    const { start, end } = input as z.infer<typeof calculateTimeUsageSchema>;
    const ms = await calendarService.calculateTimeUsage(new Date(start), new Date(end));
    const hours = ms / (1000 * 60 * 60);
    return `Total hours: ${hours}`;
  },
  {
    name: 'calculate_time_usage',
    description: 'Calculate total appointment hours for a period',
    schema: calculateTimeUsageSchema,
  },
);

export const findFreeTimeSlotsTool = tool(
  async (input) => {
    const { start, end } = input as z.infer<typeof findFreeTimeSlotsSchema>;
    const slots = await calendarService.findFreeTimeSlots(new Date(start), new Date(end));
    const formatted = formatSlotTimes(slots);
    return JSON.stringify(formatted, null, 2);
  },
  {
    name: 'find_free_time_slots',
    description: 'Find available time slots between two dates',
    schema: findFreeTimeSlotsSchema,
  },
);

export const visualizeCalendarBoardTool = tool(
  async (input) => {
    const params = input as z.infer<typeof visualizeCalendarBoardSchema>;
    logInfo('CalendarTool', 'Visualizing calendar board via tool', {
      startDate: params.startDate,
      endDate: params.endDate,
      title: params.title
    });
    
    try {
      // Buscar eventos no período especificado
      const events = await calendarService.searchEventsByTime(
        new Date(params.startDate), 
        new Date(params.endDate)
      );
      
      logInfo('CalendarTool', 'Calendar events retrieved for board visualization', {
        eventCount: events.length,
        dateRange: `${params.startDate} - ${params.endDate}`
      });
      
      // Criar visualização board simplificada para o chat
      const boardVisualization = CalendarBoardVisualizer.createSimpleCalendarBoardText(events, {
        title: params.title,
        showDescription: params.showDescription,
        maxEventsPerDay: params.maxEventsPerDay,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate)
      });
      
      // Armazenar dados do board para modo visual (será usado pela UI)
      (global as any).__CLAUDIA_CALENDAR_BOARD_DATA__ = {
        events,
        options: {
          title: params.title || 'Reuniões',
          showDescription: params.showDescription,
          maxEventsPerDay: params.maxEventsPerDay,
          startDate: new Date(params.startDate),
          endDate: new Date(params.endDate)
        }
      };
      
      const result = {
        success: true,
        period: `${params.startDate} até ${params.endDate}`,
        totalEvents: events.length,
        visualization: boardVisualization,
        visualMode: true // Flag para indicar que há dados para modo visual
      };
      
      logInfo('CalendarTool', 'Calendar board visualization created successfully', {
        totalEvents: events.length,
        period: `${params.startDate} - ${params.endDate}`
      });
      
      // Return com marcador especial para modo visual
      return `🎯 **CALENDAR_BOARD_VISUAL_MODE** 🎯\n\n✅ **Visualização Board de Reuniões Criada!**\n\n${boardVisualization}\n\n📊 **Resumo:**\n- **Período:** ${params.startDate} até ${params.endDate}\n- **Total de Reuniões:** ${events.length}\n- **Título:** ${params.title || 'Reuniões'}\n\n{bold}{yellow-fg}💡 Pressione 'B' para abrir a visualização gráfica do calendário!{/yellow-fg}{/bold}`;
    } catch (error) {
      logError('CalendarTool', 'Error visualizing calendar board via tool', error as Error, params);
      return `❌ **Erro ao visualizar reuniões em board:**\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    }
  },
  {
    name: 'visualize_calendar_board',
    description: 'Create a visual board representation of calendar events/meetings organized by day columns, showing title and source (Google/Microsoft) for each meeting card with clickable details',
    schema: visualizeCalendarBoardSchema,
  },
);

export const calendarTools = [
  searchDayEventsTool,
  searchWeekEventsTool,
  searchMonthEventsTool,
  searchEventsByTimeTool,
  calculateTimeUsageTool,
  findFreeTimeSlotsTool,
  visualizeCalendarBoardTool,
];
