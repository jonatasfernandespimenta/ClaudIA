import { Board } from "../../domain/entities/board";
import { Card } from "../../domain/entities/card";

export interface BoardAdapter {
  /**
   * Get a board by its ID
   * @param id - The board ID
   * @returns Promise<Board> - The board entity
   */
  getBoardById(id: string): Promise<Board>;

  /**
   * Get a board by its name
   * @param name - The board name
   * @returns Promise<Board | null> - The board entity or null if not found
   */
  getBoardByName(name: string): Promise<Board | null>;

  /**
   * Get all phases/columns of a board
   * @param boardId - The board ID
   * @returns Promise<string[]> - Array of phase names
   */
  getBoardPhases(boardId: string): Promise<string[]>;

  /**
   * Get all boards accessible to the user
   * @returns Promise<Board[]> - Array of board entities
   */
  getAllBoards(): Promise<Board[]>;

  /**
   * Get all cards from a specific phase
   * @param boardId - The board ID
   * @param phase - The phase/column name
   * @returns Promise<Card[]> - Array of card entities
   */
  getCardsFromPhase(boardId: string, phase: string): Promise<Card[]>;

  /**
   * Get all cards assigned to a specific user
   * @param assignee - The assignee username or ID
   * @returns Promise<Card[]> - Array of card entities
   */
  getCardsFromAssignee(assignee: string): Promise<Card[]>;

  /**
   * Move a card to a different phase
   * @param cardId - The card ID
   * @param newPhase - The destination phase/column
   * @returns Promise<Card> - The updated card entity
   */
  moveCard(cardId: string, newPhase: string): Promise<Card>;

  /**
   * Update card details
   * @param cardId - The card ID
   * @param updates - Partial card data to update
   * @returns Promise<Card> - The updated card entity
   */
  updateCard(cardId: string, updates: Partial<Card>): Promise<Card>;

  /**
   * Create a new card in a specific phase
   * @param boardId - The board ID
   * @param phase - The phase/column to add the card
   * @param cardData - The card data
   * @returns Promise<Card> - The created card entity
   */
  createCard(boardId: string, phase: string, cardData: Omit<Card, 'id'>): Promise<Card>;

  /**
   * Get adapter-specific configuration info
   * @returns AdapterInfo - Information about the adapter
   */
  getAdapterInfo(): AdapterInfo;
}

export interface AdapterInfo {
  name: string;
  type: 'pipefy' | 'shortcut';
  version: string;
  supportedFeatures: string[];
}

export interface AdapterConfig {
  type: 'pipefy' | 'shortcut';
  apiKey: string;
  baseUrl?: string;
  organizationId?: string;
  workspaceId?: string;
}
