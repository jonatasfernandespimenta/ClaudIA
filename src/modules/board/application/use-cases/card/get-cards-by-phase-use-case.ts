import { Card } from "../../../domain/entities/card";
import { CardRepository } from "../../../domain/repositories/card-repository";

export interface GetCardsByPhaseRequest {
  phase: string;
}

export interface GetCardsByPhaseResponse {
  success: boolean;
  cards?: Card[];
  error?: string;
}

export class GetCardsByPhaseUseCase {
  constructor(private cardRepository: CardRepository) {}

  async execute(request: GetCardsByPhaseRequest): Promise<GetCardsByPhaseResponse> {
    try {
      if (!request.phase?.trim()) {
        return {
          success: false,
          error: "Phase name is required"
        };
      }

      const cards = this.cardRepository.getCardsFromPhase(request.phase);

      return {
        success: true,
        cards
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve cards from phase"
      };
    }
  }
}
