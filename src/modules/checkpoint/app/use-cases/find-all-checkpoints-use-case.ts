import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";

interface Output {
  checkpoints: string[];
  total: number;
}

export class FindAllCheckpointsUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(): Promise<Output> {
    const checkpoints = await this.checkpointRepository.findAll();

    return {
      checkpoints: checkpoints.map(checkpoint => checkpoint.toString()),
      total: checkpoints.length
    };
  }
}
