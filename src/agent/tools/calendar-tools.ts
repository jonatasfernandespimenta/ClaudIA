import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  searchDayEventsSchema,
  searchWeekEventsSchema,
  searchMonthEventsSchema,
  searchEventsByTimeSchema,
  calculateTimeUsageSchema,
  findFreeTimeSlotsSchema,
} from './calendar-schemas';
import { logInfo, logError } from '../../utils/logger';

import { CalendarRepository } from '../../modules/calendar/domain/calendar-repository.interface';
import { PrismaCalendarRepository } from '../../modules/calendar/infra/prisma-calendar-repository';
import { CalendarService } from '../../modules/calendar/application/calendar-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const calendarRepository: CalendarRepository = new PrismaCalendarRepository(prisma);
const calendarService = new CalendarService(calendarRepository);

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
      return JSON.stringify(events, null, 2);
    } catch (error) {
      logError('CalendarTool', 'Error searching day events via tool', error as Error, { date });
      throw error;
    }
  },
  {
    name: 'search_day_events',
    description: 'Search and retrieve calendar events for a specific day, returning complete event information including exact titles, times, descriptions, locations, and attendees from Google Calendar, Microsoft Calendar, or other connected sources',
    schema: searchDayEventsSchema,
  },
);

export const searchWeekEventsTool = tool(
  async (input) => {
    const { date } = input as z.infer<typeof searchWeekEventsSchema>;
    const events = await calendarService.searchWeekEvents(new Date(date));
    return JSON.stringify(events, null, 2);
  },
  {
    name: 'search_week_events',
    description: 'Search and retrieve calendar events for an entire week, returning complete event information including exact titles, times, descriptions, locations, and attendees from all connected calendar sources',
    schema: searchWeekEventsSchema,
  },
);

export const searchMonthEventsTool = tool(
  async (input) => {
    const { month, year } = input as z.infer<typeof searchMonthEventsSchema>;
    const events = await calendarService.searchMonthEvents(new Date(year, month - 1, 1));
    return JSON.stringify(events, null, 2);
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
    return JSON.stringify(events, null, 2);
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
    return JSON.stringify(slots, null, 2);
  },
  {
    name: 'find_free_time_slots',
    description: 'Find available time slots between two dates',
    schema: findFreeTimeSlotsSchema,
  },
);

export const calendarTools = [
  searchDayEventsTool,
  searchWeekEventsTool,
  searchMonthEventsTool,
  searchEventsByTimeTool,
  calculateTimeUsageTool,
  findFreeTimeSlotsTool,
];
