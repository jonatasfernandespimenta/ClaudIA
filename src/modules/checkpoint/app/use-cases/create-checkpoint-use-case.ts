import { Checkpoint } from "../../domain/entities/checkpoint";
import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";

interface Input {
  projectName: string;
  summary: string;
}

export class CreateCheckpointUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(props: Input) {
    const checkpoint = Checkpoint.create(props);

    await this.checkpointRepository.save(checkpoint);

    return checkpoint.toString();
  }
}
