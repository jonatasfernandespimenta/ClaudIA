import { tool } from "@langchain/core/tools";
import { z } from 'zod';
import { BoardServiceManager } from '../../modules/board/infra/board-service-manager';
import { AdapterConfig } from '../../modules/board/infra/adapters/board-adapter';
import { Card } from '../../modules/board/domain/entities/card';
import {
  GetAllBoardsSchema,
  GetBoardByIdSchema,
  GetBoardByNameSchema,
  GetBoardPhasesSchema,
  GetCardsFromPhaseSchema,
  GetCardsFromAssigneeSchema,
  MoveCardSchema,
  UpdateCardSchema,
  CreateCardSchema,
  GetAdapterInfoSchema
} from './board-schemas';
import { logInfo, logError } from '../../utils/logger';

// Global instance - in a real app, this would be managed by DI container
let boardServiceManager: BoardServiceManager | null = null;

function getBoardServiceManager(): BoardServiceManager {
  if (!boardServiceManager) {
    // Initialize with default configs - in a real app, this would come from environment/config
    const configs: AdapterConfig[] = [];
    
    // Add Pipefy config if environment variables are present
    if (process.env.PIPEFY_API_KEY) {
      configs.push({
        type: 'pipefy',
        apiKey: process.env.PIPEFY_API_KEY,
        organizationId: process.env.PIPEFY_ORGANIZATION_ID
      });
    }
    
    // Add Shortcut config if environment variables are present
    if (process.env.SHORTCUT_API_KEY) {
      configs.push({
        type: 'shortcut',
        apiKey: process.env.SHORTCUT_API_KEY,
        workspaceId: process.env.SHORTCUT_WORKSPACE_ID
      });
    }

    boardServiceManager = new BoardServiceManager(configs);
  }
  
  return boardServiceManager;
}

export const getAllBoardsTool = tool(
  async (input) => {
    const params = input as z.infer<typeof GetAllBoardsSchema>;
    logInfo('BoardTool', 'Getting all boards via tool', { source: params.source });
    
    try {
      const manager = getBoardServiceManager();
      const boards = await manager.getAllBoards({ source: params.source });
      
      const result = {
        success: true,
        boards: boards.map(board => ({
          id: board.id,
          title: board.title,
          description: board.description,
          phases: board.phases,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt
        })),
        total: boards.length,
        source: params.source
      };
      
      logInfo('BoardTool', 'All boards retrieved successfully via tool', {
        source: params.source,
        total: boards.length
      });
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logError('BoardTool', 'Error getting all boards via tool', error as Error, params);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }, null, 2);
    }
  },
  {
    name: "get_all_boards",
    description: "Get all boards from specified sources (Pipefy, Shortcut, or all)",
    schema: GetAllBoardsSchema
  }
);

export const getCardsFromAssigneeTool = tool(
  async (input) => {
    const params = input as z.infer<typeof GetCardsFromAssigneeSchema>;
    logInfo('BoardTool', 'Getting cards from assignee via tool', { assignee: params.assignee, source: params.source });
    
    try {
      const manager = getBoardServiceManager();
      const cards = await manager.getCardsFromAssignee(params.assignee, { source: params.source });
      
      const result = {
        success: true,
        assignee: params.assignee,
        cards: cards.map(card => ({
          id: card.id,
          title: card.title,
          description: card.description,
          currentPhase: card.currentPhase,
          assignees: card.assignees,
          expiresAt: card.expiresAt,
          createdAt: card.createdAt
        })),
        total: cards.length,
        source: params.source
      };
      
      logInfo('BoardTool', 'Cards from assignee retrieved successfully via tool', {
        assignee: params.assignee,
        total: cards.length
      });
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logError('BoardTool', 'Error getting cards from assignee via tool', error as Error, params);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }, null, 2);
    }
  },
  {
    name: "get_cards_from_assignee",
    description: "Get all cards assigned to a specific user from Pipefy, Shortcut, or both",
    schema: GetCardsFromAssigneeSchema
  }
);

export const boardTools = [
  getAllBoardsTool,
  getCardsFromAssigneeTool
];
