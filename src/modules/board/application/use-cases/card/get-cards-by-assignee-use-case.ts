import { Card } from "../../../domain/entities/card";
import { CardRepository } from "../../../domain/repositories/card-repository";

export interface GetCardsByAssigneeRequest {
  assignee: string;
}

export interface GetCardsByAssigneeResponse {
  success: boolean;
  cards?: Card[];
  error?: string;
}

export class GetCardsByAssigneeUseCase {
  constructor(private cardRepository: CardRepository) {}

  async execute(request: GetCardsByAssigneeRequest): Promise<GetCardsByAssigneeResponse> {
    try {
      if (!request.assignee?.trim()) {
        return {
          success: false,
          error: "Assignee is required"
        };
      }

      const cards = this.cardRepository.getCardsFromAssignee(request.assignee);

      return {
        success: true,
        cards
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve cards for assignee"
      };
    }
  }
}
