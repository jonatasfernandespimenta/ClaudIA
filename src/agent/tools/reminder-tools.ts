import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { 
  createReminderToolSchema,
  findReminderByIdToolSchema,
  findRemindersByStatusToolSchema,
  updateReminderStatusToolSchema,
  findAllRemindersSinceToolSchema,
  findAllRemindersToolSchema,
  visualizeRemindersBoardToolSchema
} from "./reminder-schemas";
import { logInfo, logError } from "../../utils/logger";
import { ReminderBoardVisualizer } from "../../utils/reminder-board-visualizer";

import { ReminderRepository } from "../../modules/reminder/domain/repositories/reminder-repository";
import { PrismaReminderRepository } from "../../modules/reminder/infra/prisma-reminder-repository";
import { CreateReminderUseCase } from "../../modules/reminder/app/use-cases/create-reminder-use-case";
import { FindAllRemindersUseCase } from "../../modules/reminder/app/use-cases/find-all-reminders-use-case";
import { FindReminderByIdUseCase } from "../../modules/reminder/app/use-cases/find-reminder-by-id-use-case";
import { FindRemindersByStatusUseCase } from "../../modules/reminder/app/use-cases/find-reminders-by-status-use-case";
import { FindAllRemindersSinceUseCase } from "../../modules/reminder/app/use-cases/find-all-reminders-since-use-case";
import { UpdateReminderStatusUseCase } from "../../modules/reminder/app/use-cases/update-reminder-status-use-case";
import { ReminderStatus } from "../../modules/reminder/domain/entities/reminder";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const reminderRepository: ReminderRepository = new PrismaReminderRepository(prisma);

export const createReminderTool = tool(
  async (input) => {
    const { message, status } = input as z.infer<typeof createReminderToolSchema>;
    logInfo('ReminderTool', 'Creating reminder via tool', { 
      messageLength: message.length,
      status: status || 'PENDING'
    });
    
    try {
      const createReminder = new CreateReminderUseCase(reminderRepository);
      const result = await createReminder.execute({ 
        message, 
        status: status ? status as ReminderStatus : undefined 
      });
      
      logInfo('ReminderTool', 'Reminder created successfully via tool', { 
        messageLength: message.length
      });
      
      return result;
    } catch (error) {
      logError('ReminderTool', 'Error creating reminder via tool', error as Error, { message, status });
      throw error;
    }
  },
  {
    name: "create_reminder",
    description: "Create a new reminder with a message and optional status",
    schema: createReminderToolSchema
  }
);

export const findAllRemindersTool = tool(
  async () => {
    const findAllReminders = new FindAllRemindersUseCase(reminderRepository);
    const result = await findAllReminders.execute();
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_all_reminders",
    description: "Retrieve all reminders, ordered by creation date (newest first)",
    schema: findAllRemindersToolSchema
  }
);

export const findReminderByIdTool = tool(
  async (input) => {
    const findReminderById = new FindReminderByIdUseCase(reminderRepository);
    const result = await findReminderById.execute(input as z.infer<typeof findReminderByIdToolSchema>);
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_reminder_by_id",
    description: "Find a specific reminder by its unique identifier",
    schema: findReminderByIdToolSchema
  }
);

export const findRemindersByStatusTool = tool(
  async (input) => {
    const { status } = input as z.infer<typeof findRemindersByStatusToolSchema>;
    const findRemindersByStatus = new FindRemindersByStatusUseCase(reminderRepository);
    const result = await findRemindersByStatus.execute({ status: status as ReminderStatus });
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_reminders_by_status",
    description: "Find all reminders with a specific status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)",
    schema: findRemindersByStatusToolSchema
  }
);

export const updateReminderStatusTool = tool(
  async (input) => {
    const { id, status } = input as z.infer<typeof updateReminderStatusToolSchema>;
    logInfo('ReminderTool', 'Updating reminder status via tool', { 
      id, 
      newStatus: status
    });
    
    try {
      const updateReminderStatus = new UpdateReminderStatusUseCase(reminderRepository);
      const result = await updateReminderStatus.execute({ id, status: status as ReminderStatus });
      
      logInfo('ReminderTool', 'Reminder status updated successfully via tool', { 
        id, 
        updated: result.updated,
        newStatus: status
      });
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logError('ReminderTool', 'Error updating reminder status via tool', error as Error, { id, status });
      throw error;
    }
  },
  {
    name: "update_reminder_status",
    description: "Update the status of an existing reminder",
    schema: updateReminderStatusToolSchema
  }
);

export const findAllRemindersSinceTool = tool(
  async (input) => {
    const { date } = input as z.infer<typeof findAllRemindersSinceToolSchema>;
    const findAllRemindersSince = new FindAllRemindersSinceUseCase(reminderRepository);
    const result = await findAllRemindersSince.execute({ date: new Date(date) });
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_all_reminders_since",
    description: "Find all reminders created since a specific date, with date range information",
    schema: findAllRemindersSinceToolSchema
  }
);

export const visualizeRemindersBoardTool = tool(
  async (input) => {
    const params = input as z.infer<typeof visualizeRemindersBoardToolSchema>;
    logInfo('ReminderTool', 'Creating board visualization for reminders', {
      title: params.title,
      showDates: params.showDates,
      maxRemindersPerColumn: params.maxRemindersPerColumn
    });
    
    try {
      // Buscar todos os reminders
      const findAllReminders = new FindAllRemindersUseCase(reminderRepository);
      const result = await findAllReminders.execute();
      
      // Converter strings de volta para objetos Reminder
      const reminderObjects = result.reminders.map(reminderStr => {
        const match = reminderStr.match(/Reminder \[id=([^,]+), message=([^,]+), status=([^,]+), createdAt=([^,]+), updatedAt=([^\]]+)\]/);
        if (!match) return null;
        
        const [, id, message, status, createdAt, updatedAt] = match;
        return {
          id,
          message,
          status: status as any,
          createdAt: new Date(createdAt),
          updatedAt: new Date(updatedAt)
        };
      }).filter(Boolean) as any[];
      
      logInfo('ReminderTool', 'Reminders retrieved for board visualization', {
        reminderCount: reminderObjects.length
      });
      
      // Criar visualização board simplificada para o chat
      const boardVisualization = ReminderBoardVisualizer.createSimpleReminderBoardText(reminderObjects, {
        title: params.title || 'Reminders',
        showDates: params.showDates !== false,
        maxRemindersPerColumn: params.maxRemindersPerColumn || 8
      });
      
      // Armazenar dados para modo visual (será usado pela UI)
      (global as any).__CLAUDIA_REMINDERS_BOARD_DATA__ = {
        reminders: reminderObjects,
        options: {
          title: params.title || 'Reminders',
          showDates: params.showDates !== false,
          maxRemindersPerColumn: params.maxRemindersPerColumn || 8,
          width: params.width || 120,
          height: params.height || 30
        }
      };
      
      const result_data = {
        success: true,
        totalReminders: reminderObjects.length,
        visualization: boardVisualization,
        visualMode: true // Flag para indicar que há dados para modo visual
      };
      
      logInfo('ReminderTool', 'Board visualization created successfully', {
        totalReminders: reminderObjects.length
      });
      
      // Return com marcador especial para modo visual
      return `🎯 **REMINDER_BOARD_VISUAL_MODE** 🎯\n\n✅ **Visualização Board de Reminders Criada!**\n\n${boardVisualization}\n\n📊 **Resumo:**\n- **Total de Reminders:** ${reminderObjects.length}\n- **Título:** ${params.title || 'Reminders'}\n- **Organização:** Colunas por status com cards interativos\n\n💡 **Pressione 'R' para abrir a visualização gráfica do board de reminders!**`;
    } catch (error) {
      logError('ReminderTool', 'Error creating board visualization', error as Error, params);
      return `❌ **Erro ao visualizar reminders em board:**\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    }
  },
  {
    name: "visualize_reminders_board",
    description: "Create a visual board representation of reminders organized by status columns (Pending, In Progress, Completed, Cancelled), showing each reminder as a card with message, date, and ID",
    schema: visualizeRemindersBoardToolSchema
  }
);

export const reminderTools = [
  createReminderTool,
  findAllRemindersTool,
  findReminderByIdTool,
  findRemindersByStatusTool,
  updateReminderStatusTool,
  findAllRemindersSinceTool,
  visualizeRemindersBoardTool
];
