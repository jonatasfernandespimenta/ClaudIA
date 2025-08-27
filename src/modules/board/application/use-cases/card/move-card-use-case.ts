import { CardRepository } from "../../../domain/repositories/card-repository";
import { BoardRepository } from "../../../domain/repositories/board-repository";

export interface MoveCardRequest {
  cardId: string;
  currentPhase: string;
  targetPhase: string;
  boardId: string;
}

export interface MoveCardResponse {
  success: boolean;
  error?: string;
}

export class MoveCardUseCase {
  constructor(
    private cardRepository: CardRepository,
    private boardRepository: BoardRepository
  ) {}

  async execute(request: MoveCardRequest): Promise<MoveCardResponse> {
    try {
      if (!request.cardId?.trim()) {
        return {
          success: false,
          error: "Card ID is required"
        };
      }

      if (!request.currentPhase?.trim()) {
        return {
          success: false,
          error: "Current phase is required"
        };
      }

      if (!request.targetPhase?.trim()) {
        return {
          success: false,
          error: "Target phase is required"
        };
      }

      if (!request.boardId?.trim()) {
        return {
          success: false,
          error: "Board ID is required"
        };
      }

      const boardPhases = this.boardRepository.getBoardPhases(request.boardId);
      if (!boardPhases || boardPhases.length === 0) {
        return {
          success: false,
          error: "Board not found or has no phases"
        };
      }

      if (!boardPhases.includes(request.targetPhase)) {
        return {
          success: false,
          error: `Target phase "${request.targetPhase}" does not exist in this board`
        };
      }

      const currentPhaseCards = this.cardRepository.getCardsFromPhase(request.currentPhase);
      const cardToMove = currentPhaseCards.find(card => card.id === request.cardId);

      if (!cardToMove) {
        return {
          success: false,
          error: "Card not found in the specified current phase"
        };
      }

      const updatedCardProps = {
        ...cardToMove.toJSON(),
        currentPhase: request.targetPhase
      };

      this.cardRepository.updateCard(updatedCardProps);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to move card"
      };
    }
  }
}
