import { createId } from '@paralleldrive/cuid2'

export interface CheckpointProps {
  projectName: string;
  summary: string;
}

export class Checkpoint {
  constructor(
    public projectName: string,
    public summary: string,
    public createdAt: Date = new Date(),
    public readonly id?: string,
  ) {}

  static create(props: CheckpointProps) {
    const summary = props.summary.replace('-', '\n-')

    return new Checkpoint(
      props.projectName,
      summary,
      new Date(),
      createId()
    );
  }

  toString() {
    return `Checkpoint [id=${this.id}, projectName=${this.projectName}, summary=${this.summary}, createdAt=${this.createdAt.toISOString()}]`;
  }
}
