import { z } from "zod";

export const getBrazilDateTimeToolSchema = z.object({
  format: z.enum(['default', 'iso', 'timestamp', 'full']).optional().describe('Formato de saída da data/hora (default: formato brasileiro DD/MM/AAAA HH:MM:SS)')
});

export const getShortTermMemorySchema = z.object({
  limit: z.number().optional().describe('Número máximo de registros de memória para retornar (opcional)')
});