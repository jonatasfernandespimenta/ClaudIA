import { z } from 'zod';

export const searchDayEventsSchema = z.object({
  date: z.string().describe('ISO date string for the day to search'),
});

export const searchWeekEventsSchema = z.object({
  date: z.string().describe('ISO date within the week to search'),
});

export const searchMonthEventsSchema = z.object({
  month: z.number().min(1).max(12).describe('Month number (1-12)'),
  year: z.number().describe('Full year (e.g. 2024)'),
});

export const searchEventsByTimeSchema = z.object({
  start: z.string().describe('Start of range (ISO date string)'),
  end: z.string().describe('End of range (ISO date string)'),
});

export const calculateTimeUsageSchema = z.object({
  start: z.string().describe('Start of range (ISO date string)'),
  end: z.string().describe('End of range (ISO date string)'),
});

export const findFreeTimeSlotsSchema = z.object({
  start: z.string().describe('Start of range (ISO date string)'),
  end: z.string().describe('End of range (ISO date string)'),
});

export const visualizeCalendarBoardSchema = z.object({
  startDate: z.string().describe('Start date for the period to visualize (ISO date string)'),
  endDate: z.string().describe('End date for the period to visualize (ISO date string)'),
  title: z.string().optional().describe('Optional custom title for the board'),
  showDescription: z.boolean().optional().default(true).describe('Whether to show event descriptions'),
  maxEventsPerDay: z.number().optional().default(8).describe('Maximum events to show per day column'),
});
