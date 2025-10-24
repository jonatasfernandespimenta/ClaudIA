import { z } from 'zod';

export const addKnowledgeSchema = z.object({
  text: z.string().describe('The knowledge text to be structured and stored'),
  category: z.string().optional().describe('Optional category for the knowledge (e.g., "programming", "personal", "fact")'),
});

export const searchKnowledgeSchema = z.object({
  query: z.string().describe('The query to search for relevant knowledge'),
  topK: z.number().optional().default(5).describe('Number of results to return (default: 5)'),
});
