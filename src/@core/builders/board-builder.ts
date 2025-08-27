import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { Board } from "../../modules/board/domain/entities/board";

export class BoardBuilder {
  private id: string = createId();
  private title: string = faker.company.name();
  private description?: string = faker.lorem.paragraph();
  private createdAt?: string = faker.date.past().toISOString();
  private updatedAt?: string = faker.date.recent().toISOString();
  private phases: string[] = ["To Do", "In Progress", "Done"];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withoutDescription(): this {
    this.description = undefined;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: string): this {
    this.updatedAt = updatedAt;
    return this;
  }

  withPhases(phases: string[]): this {
    this.phases = phases;
    return this;
  }

  withDefaultPhases(): this {
    this.phases = ["To Do", "In Progress", "Review", "Done"];
    return this;
  }

  build(): Board {
    return new Board(
      this.id,
      this.title,
      this.phases,
      this.description,
      this.createdAt,
      this.updatedAt
    );
  }
}
