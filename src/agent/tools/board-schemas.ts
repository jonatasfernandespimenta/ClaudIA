import { z } from 'zod';

export const BoardSourceSchema = z.enum(['pipefy', 'shortcut', 'all']).optional().default('all');

export const GetAllBoardsSchema = z.object({
  source: BoardSourceSchema.describe('Source to get boards from (pipefy, shortcut, or all)')
});

export const GetBoardByIdSchema = z.object({
  id: z.string().describe('The board ID to search for'),
  source: BoardSourceSchema.describe('Source to search in (pipefy, shortcut, or all)')
});

export const GetBoardByNameSchema = z.object({
  name: z.string().describe('The board name to search for'),
  source: BoardSourceSchema.describe('Source to search in (pipefy, shortcut, or all)')
});

export const GetBoardPhasesSchema = z.object({
  boardId: z.string().describe('The board ID to get phases from'),
  source: BoardSourceSchema.describe('Source to search in (pipefy, shortcut, or all)')
});

export const GetCardsFromPhaseSchema = z.object({
  boardId: z.string().describe('The board ID'),
  phase: z.string().describe('The phase/column name to get cards from'),
  source: BoardSourceSchema.describe('Source to search in (pipefy, shortcut, or all)')
});

export const GetCardsFromAssigneeSchema = z.object({
  assignee: z.string().describe('The assignee name or ID to get cards for'),
  source: BoardSourceSchema.describe('Source to search in (pipefy, shortcut, or all)')
});

export const MoveCardSchema = z.object({
  cardId: z.string().describe('The card ID to move'),
  newPhase: z.string().describe('The destination phase/column name'),
  source: BoardSourceSchema.describe('Source to perform the action in (pipefy, shortcut, or all)')
});

export const UpdateCardSchema = z.object({
  cardId: z.string().describe('The card ID to update'),
  title: z.string().optional().describe('New title for the card'),
  description: z.string().optional().describe('New description for the card'),
  expiresAt: z.string().optional().describe('New expiration date (ISO string)'),
  assignees: z.array(z.string()).optional().describe('Array of assignee names/IDs'),
  source: BoardSourceSchema.describe('Source to perform the action in (pipefy, shortcut, or all)')
});

export const CreateCardSchema = z.object({
  boardId: z.string().describe('The board ID where to create the card'),
  phase: z.string().describe('The phase/column name where to create the card'),
  title: z.string().describe('The card title'),
  description: z.string().optional().describe('The card description'),
  expiresAt: z.string().optional().describe('Card expiration date (ISO string)'),
  assignees: z.array(z.string()).optional().describe('Array of assignee names/IDs'),
  source: BoardSourceSchema.describe('Source to create the card in (pipefy, shortcut, or all)')
});

export const GetAdapterInfoSchema = z.object({
  type: z.enum(['pipefy', 'shortcut']).optional().describe('Specific adapter type to get info for, or all if not specified')
});
