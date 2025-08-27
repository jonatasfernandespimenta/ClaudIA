import { Card, CardProps } from "../../domain/entities/card";
import { CardRepository } from "../../domain/repositories/card-repository";
import { BoardAdapter } from "../adapters/board-adapter";

export class ExternalCardRepository implements CardRepository {
  constructor(private readonly adapter: BoardAdapter) {}

  getCardsFromPhase(phase: string): Card[] {
    // Convert async to sync - in a real implementation you might want to handle this differently
    throw new Error("Use async version: getCardsFromPhaseAsync - also need boardId parameter");
  }

  getCardsFromAssignee(assignee: string): Card[] {
    // Convert async to sync - in a real implementation you might want to handle this differently
    throw new Error("Use async version: getCardsFromAssigneeAsync");
  }

  updateCard(card: CardProps): void {
    // Convert async to sync - in a real implementation you might want to handle this differently
    throw new Error("Use async version: updateCardAsync - also need cardId parameter");
  }

  // Async versions that actually work with the adapters
  async getCardsFromPhaseAsync(boardId: string, phase: string): Promise<Card[]> {
    return await this.adapter.getCardsFromPhase(boardId, phase);
  }

  async getCardsFromAssigneeAsync(assignee: string): Promise<Card[]> {
    return await this.adapter.getCardsFromAssignee(assignee);
  }

  async updateCardAsync(cardId: string, updates: Partial<Card>): Promise<Card> {
    return await this.adapter.updateCard(cardId, updates);
  }

  async moveCardAsync(cardId: string, newPhase: string): Promise<Card> {
    return await this.adapter.moveCard(cardId, newPhase);
  }

  async createCardAsync(boardId: string, phase: string, cardData: Omit<Card, 'id'>): Promise<Card> {
    return await this.adapter.createCard(boardId, phase, cardData);
  }

  getAdapterInfo() {
    return this.adapter.getAdapterInfo();
  }
}
