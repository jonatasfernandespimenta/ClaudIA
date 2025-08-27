import { CardProps } from "../../../domain/entities/card";
import { CardRepository } from "../../../domain/repositories/card-repository";

export interface UpdateCardRequest extends CardProps {
  // CardProps already contains all the necessary fields
}

export interface UpdateCardResponse {
  success: boolean;
  error?: string;
}

export class UpdateCardUseCase {
  constructor(private cardRepository: CardRepository) {}

  async execute(request: UpdateCardRequest): Promise<UpdateCardResponse> {
    try {
      // Validate required fields
      if (!request.title?.trim()) {
        return {
          success: false,
          error: "Card title is required"
        };
      }

      if (!request.currentPhase?.trim()) {
        return {
          success: false,
          error: "Current phase is required"
        };
      }

      // Validate expiration date if provided
      if (request.expiresAt) {
        const expirationDate = new Date(request.expiresAt);
        if (isNaN(expirationDate.getTime())) {
          return {
            success: false,
            error: "Invalid expiration date format"
          };
        }
      }

      // Validate assignees if provided
      if (request.assignees && request.assignees.some(assignee => !assignee.trim())) {
        return {
          success: false,
          error: "Assignee names cannot be empty"
        };
      }

      this.cardRepository.updateCard(request);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update card"
      };
    }
  }
}
