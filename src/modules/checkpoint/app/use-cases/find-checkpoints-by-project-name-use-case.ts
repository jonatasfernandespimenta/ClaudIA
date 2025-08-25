import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";

interface Input {
  projectName: string;
}

interface Output {
  checkpoints: string[];
  total: number;
  projectName: string;
}

export class FindCheckpointsByProjectNameUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    const checkpoints = await this.checkpointRepository.findByProjectName(props.projectName);

    return {
      checkpoints: checkpoints.map(checkpoint => checkpoint.toString()),
      total: checkpoints.length,
      projectName: props.projectName
    };
  }
}
