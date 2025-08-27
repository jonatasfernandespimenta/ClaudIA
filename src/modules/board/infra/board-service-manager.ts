import { Board } from "../domain/entities/board";
import { Card } from "../domain/entities/card";
import { BoardAdapter, AdapterConfig } from "./adapters/board-adapter";
import { AdapterFactory } from "./adapters/adapter-factory";

export interface BoardServiceOptions {
  source?: 'pipefy' | 'shortcut' | 'all';
}

export class BoardServiceManager {
  private adapters: Map<string, BoardAdapter> = new Map();

  constructor(configs: AdapterConfig[]) {
    this.initializeAdapters(configs);
  }

  private initializeAdapters(configs: AdapterConfig[]) {
    for (const config of configs) {
      if (AdapterFactory.validateConfig(config)) {
        const adapter = AdapterFactory.createAdapter(config);
        this.adapters.set(config.type, adapter);
      } else {
        console.warn(`Invalid configuration for adapter type: ${config.type}`);
      }
    }
  }

  /**
   * Get all configured adapters
   */
  getAdapters(): Map<string, BoardAdapter> {
    return new Map(this.adapters);
  }

  /**
   * Get a specific adapter by type
   */
  getAdapter(type: 'pipefy' | 'shortcut'): BoardAdapter | undefined {
    return this.adapters.get(type);
  }

  /**
   * Get all boards from specified sources
   */
  async getAllBoards(options: BoardServiceOptions = {}): Promise<Board[]> {
    const { source } = options;
    const boards: Board[] = [];

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        const adapterBoards = await adapter.getAllBoards();
        boards.push(...adapterBoards);
      }
    } else {
      // Get boards from all adapters
      for (const [type, adapter] of this.adapters) {
        try {
          const adapterBoards = await adapter.getAllBoards();
          boards.push(...adapterBoards);
        } catch (error) {
          console.warn(`Failed to get boards from ${type}:`, error);
        }
      }
    }

    return boards;
  }

  /**
   * Get a board by ID from any source or specific source
   */
  async getBoardById(id: string, options: BoardServiceOptions = {}): Promise<Board | null> {
    const { source } = options;

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          return await adapter.getBoardById(id);
        } catch (error) {
          return null;
        }
      }
    } else {
      // Try to find the board in any adapter
      for (const [type, adapter] of this.adapters) {
        try {
          const board = await adapter.getBoardById(id);
          if (board) {
            return board;
          }
        } catch (error) {
          // Continue trying other adapters
        }
      }
    }

    return null;
  }

  /**
   * Get a board by name from any source or specific source
   */
  async getBoardByName(name: string, options: BoardServiceOptions = {}): Promise<Board | null> {
    const { source } = options;

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          return await adapter.getBoardByName(name);
        } catch (error) {
          return null;
        }
      }
    } else {
      // Try to find the board in any adapter
      for (const [type, adapter] of this.adapters) {
        try {
          const board = await adapter.getBoardByName(name);
          if (board) {
            return board;
          }
        } catch (error) {
          // Continue trying other adapters
        }
      }
    }

    return null;
  }

  /**
   * Get cards from a specific assignee across all sources or specific source
   */
  async getCardsFromAssignee(assignee: string, options: BoardServiceOptions = {}): Promise<Card[]> {
    const { source } = options;
    const cards: Card[] = [];

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          const adapterCards = await adapter.getCardsFromAssignee(assignee);
          cards.push(...adapterCards);
        } catch (error) {
          console.warn(`Failed to get cards from ${source}:`, error);
        }
      }
    } else {
      // Get cards from all adapters
      for (const [type, adapter] of this.adapters) {
        try {
          const adapterCards = await adapter.getCardsFromAssignee(assignee);
          cards.push(...adapterCards);
        } catch (error) {
          console.warn(`Failed to get cards from ${type}:`, error);
        }
      }
    }

    return cards;
  }

  /**
   * Get cards from a specific phase of a board
   */
  async getCardsFromPhase(boardId: string, phase: string, options: BoardServiceOptions = {}): Promise<Card[]> {
    const { source } = options;

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          return await adapter.getCardsFromPhase(boardId, phase);
        } catch (error) {
          console.warn(`Failed to get cards from ${source}:`, error);
          return [];
        }
      }
    } else {
      // Try to find the board and get cards from the first matching adapter
      for (const [type, adapter] of this.adapters) {
        try {
          const cards = await adapter.getCardsFromPhase(boardId, phase);
          return cards;
        } catch (error) {
          // Continue trying other adapters
        }
      }
    }

    return [];
  }

  /**
   * Move a card to a different phase
   */
  async moveCard(cardId: string, newPhase: string, options: BoardServiceOptions = {}): Promise<Card | null> {
    const { source } = options;

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          return await adapter.moveCard(cardId, newPhase);
        } catch (error) {
          console.warn(`Failed to move card in ${source}:`, error);
          return null;
        }
      }
    } else {
      // Try to move the card in any adapter
      for (const [type, adapter] of this.adapters) {
        try {
          return await adapter.moveCard(cardId, newPhase);
        } catch (error) {
          // Continue trying other adapters
        }
      }
    }

    return null;
  }

  /**
   * Update a card
   */
  async updateCard(cardId: string, updates: Partial<Card>, options: BoardServiceOptions = {}): Promise<Card | null> {
    const { source } = options;

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          return await adapter.updateCard(cardId, updates);
        } catch (error) {
          console.warn(`Failed to update card in ${source}:`, error);
          return null;
        }
      }
    } else {
      // Try to update the card in any adapter
      for (const [type, adapter] of this.adapters) {
        try {
          return await adapter.updateCard(cardId, updates);
        } catch (error) {
          // Continue trying other adapters
        }
      }
    }

    return null;
  }

  /**
   * Create a card in a specific board and phase
   */
  async createCard(boardId: string, phase: string, cardData: Omit<Card, 'id'>, options: BoardServiceOptions = {}): Promise<Card | null> {
    const { source } = options;

    if (source && source !== 'all') {
      const adapter = this.adapters.get(source);
      if (adapter) {
        try {
          return await adapter.createCard(boardId, phase, cardData);
        } catch (error) {
          console.warn(`Failed to create card in ${source}:`, error);
          return null;
        }
      }
    } else {
      // Try to create the card in the first available adapter that has the board
      for (const [type, adapter] of this.adapters) {
        try {
          // Check if this adapter has the board
          await adapter.getBoardById(boardId);
          return await adapter.createCard(boardId, phase, cardData);
        } catch (error) {
          // Continue trying other adapters
        }
      }
    }

    return null;
  }

  /**
   * Get information about all configured adapters
   */
  getAdapterInfo(): Array<{ type: string; info: any }> {
    const adapterInfo = [];

    for (const [type, adapter] of this.adapters) {
      adapterInfo.push({
        type,
        info: adapter.getAdapterInfo()
      });
    }

    return adapterInfo;
  }

  /**
   * Check if a specific adapter type is configured
   */
  hasAdapter(type: 'pipefy' | 'shortcut'): boolean {
    return this.adapters.has(type);
  }

  /**
   * Get list of configured adapter types
   */
  getConfiguredTypes(): string[] {
    return Array.from(this.adapters.keys());
  }
}
