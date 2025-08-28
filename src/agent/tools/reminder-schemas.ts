import { z } from 'zod';

export const createReminderToolSchema = z.object({
  message: z.string().min(1).max(1000).describe("The reminder message or task description"),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().describe("The initial status of the reminder (defaults to PENDING)"),
});

export const findReminderByIdToolSchema = z.object({
  id: z.string().min(1).describe("The unique identifier of the reminder"),
});

export const findRemindersByStatusToolSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).describe("The status to filter reminders by"),
});

export const updateReminderStatusToolSchema = z.object({
  id: z.string().min(1).describe("The unique identifier of the reminder to update"),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).describe("The new status to set for the reminder"),
});

export const findAllRemindersSinceToolSchema = z.object({
  date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid date format. Please provide a valid ISO date string." }
  ).describe("The date to search from (ISO 8601 format)"),
});

// Schema for find-all-reminders (no input needed)
export const findAllRemindersToolSchema = z.object({});

export const visualizeRemindersBoardToolSchema = z.object({
  title: z.string().optional().describe("Optional title for the reminders board"),
  showDates: z.boolean().optional().describe("Whether to show creation dates on cards"),
  maxRemindersPerColumn: z.number().optional().describe("Maximum number of reminders per column"),
  width: z.number().optional().describe("Width of the board container"),
  height: z.number().optional().describe("Height of the board container")
});
