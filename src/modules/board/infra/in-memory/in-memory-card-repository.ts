import { Card, CardProps } from "../../domain/entities/card";
import { CardRepository } from "../../domain/repositories/card-repository";

export class InMemoryCardRepository implements CardRepository {
  private cards: Map<string, Card> = new Map();

  constructor(initialCards: Card[] = []) {
    initialCards.forEach(card => {
      this.cards.set(card.id, card);
    });
  }

  getCardsFromPhase(phase: string): Card[] {
    const cards = Array.from(this.cards.values());
    return cards.filter(card => card.currentPhase === phase);
  }

  getCardsFromAssignee(assignee: string): Card[] {
    const cards = Array.from(this.cards.values());
    return cards.filter(card => 
      card.assignees && card.assignees.includes(assignee)
    );
  }

  updateCard(cardProps: CardProps): void {
    const existingCard = Array.from(this.cards.values())
      .find(card => card.title === cardProps.title);
    
    if (!existingCard) {
      throw new Error(`Card with title "${cardProps.title}" not found`);
    }

    // Update the existing card properties
    existingCard.title = cardProps.title;
    existingCard.currentPhase = cardProps.currentPhase;
    existingCard.description = cardProps.description;
    existingCard.assignees = cardProps.assignees;
    existingCard.expiresAt = cardProps.expiresAt;
  }

  // Additional methods for testing convenience
  save(card: Card): void {
    this.cards.set(card.id, card);
  }

  findById(id: string): Card | undefined {
    return this.cards.get(id);
  }

  findAll(): Card[] {
    return Array.from(this.cards.values());
  }

  delete(id: string): boolean {
    return this.cards.delete(id);
  }

  clear(): void {
    this.cards.clear();
  }

  size(): number {
    return this.cards.size;
  }

  moveCardToPhase(cardId: string, newPhase: string): void {
    const card = this.cards.get(cardId);
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    card.currentPhase = newPhase;
  }

  getCardsByMultipleAssignees(assignees: string[]): Card[] {
    const cards = Array.from(this.cards.values());
    return cards.filter(card => 
      card.assignees && 
      assignees.some(assignee => card.assignees?.includes(assignee))
    );
  }

  getExpiredCards(): Card[] {
    const now = new Date().toISOString();
    const cards = Array.from(this.cards.values());
    return cards.filter(card => 
      card.expiresAt && card.expiresAt < now
    );
  }
}
