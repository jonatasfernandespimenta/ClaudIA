interface BoardProps {
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  phases: string[];
}

export class Board {
  constructor(
    public readonly id: string,
    public title: string,
    public phases: string[],
    public description?: string,
    public createdAt?: string,
    public updatedAt?: string,
  ) {}

  toJSON(): BoardProps {
    return {
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      phases: this.phases,
    };
  }
}
