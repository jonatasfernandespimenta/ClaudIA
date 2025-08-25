import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";

interface Input {
  id: string;
}

interface Output {
  checkpoint: string | null;
  found: boolean;
}

export class FindCheckpointByIdUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    const checkpoint = await this.checkpointRepository.findById(props.id);

    if (!checkpoint) {
      return {
        checkpoint: null,
        found: false
      };
    }

    return {
      checkpoint: checkpoint.toString(),
      found: true
    };
  }
}
