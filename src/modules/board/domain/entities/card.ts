export interface CardProps {
  title: string;
  currentPhase: string;
  description?: string;
  assignees?: string[];
  expiresAt?: string;
  createdAt?: string;
}

export class Card {
  constructor(
    public readonly id: string,
    public title: string,
    public currentPhase: string,
    public description?: string,
    public assignees?: string[],
    public expiresAt?: string,
    public createdAt?: string,
  ) {}

  toJSON(): CardProps {
    return {
      title: this.title,
      currentPhase: this.currentPhase,
      description: this.description,
      assignees: this.assignees,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
    };
  }
}
