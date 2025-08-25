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
