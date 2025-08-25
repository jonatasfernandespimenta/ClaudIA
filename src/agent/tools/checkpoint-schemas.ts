import { z } from 'zod'

export const createCheckpointToolSchema = z.object({
  projectName: z.string().min(1).max(100).describe("The name of the project"),
  summary: z.string().min(1).max(1000).describe("A brief summary of what was done"),
});

export const findCheckpointByIdToolSchema = z.object({
  id: z.string().min(1).describe("The unique identifier of the checkpoint"),
});

export const findCheckpointsByProjectNameToolSchema = z.object({
  projectName: z.string().min(1).max(100).describe("The name of the project to search for"),
});

export const findAllCheckpointsSinceToolSchema = z.object({
  date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid date format. Please provide a valid ISO date string." }
  ).describe("The date to search from (ISO 8601 format)"),
});

// Schema for find-all-checkpoints (no input needed)
export const findAllCheckpointsToolSchema = z.object({});
