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
  GetAdapterInfoSchema,
  VisualizeBoardSchema
} from './board-schemas';
import { logInfo, logError } from '../../utils/logger';
import { BoardVisualizer } from '../../utils/board-visualizer';

let boardServiceManager: BoardServiceManager | null = null;

function getBoardServiceManager(): BoardServiceManager {
  if (!boardServiceManager) {
    const configs: AdapterConfig[] = [];
    
    if (process.env.PIPEFY_API_KEY) {
      configs.push({
        type: 'pipefy',
        apiKey: process.env.PIPEFY_API_KEY,
        organizationId: process.env.PIPEFY_ORGANIZATION_ID
      });
    }
    
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

export const visualizeBoardTool = tool(
  async (input) => {
    const params = input as z.infer<typeof VisualizeBoardSchema>;
    logInfo('BoardTool', 'Visualizing board via tool', { boardId: params.boardId, source: params.source });
    
    try {
      const manager = getBoardServiceManager();
      
      // Get the board info
      const board = await manager.getBoardById(params.boardId, { source: params.source });
      
      if (!board) {
        return `❌ **Board não encontrado:**\n\nO board com ID ${params.boardId} não foi encontrado na fonte ${params.source}.`;
      }
      
      // Get all cards from all phases of the board
      const allCards: Card[] = [];
      for (const phase of board.phases) {
        try {
          const phaseCards = await manager.getCardsFromPhase(params.boardId, phase, { source: params.source });
          allCards.push(...phaseCards);
        } catch (phaseError) {
          logError('BoardTool', `Error getting cards from phase ${phase}`, phaseError as Error);
          // Continue with other phases
        }
      }
      
      // Create visual board representation
      const boardVisualization = BoardVisualizer.createSimpleBoardText(board, allCards);
      
      // Store board data for visual mode (will be used by the UI)
      (global as any).__CLAUDIA_BOARD_DATA__ = {
        board,
        cards: allCards,
        options: {
          showAssignees: params.showAssignees,
          maxCardsPerPhase: params.maxCardsPerPhase,
          title: board.title
        }
      };
      
      const result = {
        success: true,
        boardId: params.boardId,
        boardTitle: board.title,
        totalCards: allCards.length,
        visualization: boardVisualization,
        source: params.source,
        visualMode: true // Flag para indicar que há dados para modo visual
      };
      
      logInfo('BoardTool', 'Board visualization created successfully via tool', {
        boardId: params.boardId,
        totalCards: allCards.length
      });
      
      // Return the visualization with special marker for visual mode
      return `🎯 **BOARD_VISUAL_MODE** 🎯\n\n✅ **Visualização do Board Criada com Sucesso!**\n\n${boardVisualization}\n\n📊 **Resumo:**\n- **Board:** ${board.title}\n- **Total de Cards:** ${allCards.length}\n- **Fases:** ${board.phases.length}\n- **Fonte:** ${params.source}\n\n{bold}{yellow-fg}💡 Pressione 'V' para abrir a visualização gráfica do board!{/yellow-fg}{/bold}`;
    } catch (error) {
      logError('BoardTool', 'Error visualizing board via tool', error as Error, params);
      return `❌ **Erro ao visualizar o board:**\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    }
  },
  {
    name: "visualize_board",
    description: "Create a visual representation of a board showing all cards organized by phases/columns",
    schema: VisualizeBoardSchema
  }
);

export const boardTools = [
  getAllBoardsTool,
  getCardsFromAssigneeTool,
  visualizeBoardTool
];
