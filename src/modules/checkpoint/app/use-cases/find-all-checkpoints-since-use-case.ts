import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";

interface Input {
  date: Date;
}

interface Output {
  checkpoints: string[];
  total: number;
  sinceDate: string;
  dateRange: {
    from: string;
    to: string;
  };
}

export class FindAllCheckpointsSinceUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    const checkpoints = await this.checkpointRepository.findAllCheckpointsSince(props.date);
    const now = new Date();

    return {
      checkpoints: checkpoints.map(checkpoint => checkpoint.toString()),
      total: checkpoints.length,
      sinceDate: props.date.toISOString(),
      dateRange: {
        from: props.date.toISOString(),
        to: now.toISOString()
      }
    };
  }
}
