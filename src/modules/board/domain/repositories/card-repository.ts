import { Card, CardProps } from "../entities/card";

export interface CardRepository {
  getCardsFromPhase(phase: string): Card[];
  getCardsFromAssignee(assignee: string): Card[];
  updateCard(card: CardProps): void;
}