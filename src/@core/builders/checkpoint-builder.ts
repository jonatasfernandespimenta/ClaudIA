import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { Checkpoint } from "../../modules/checkpoint/domain/entities/checkpoint";

export class CheckpointBuilder {
  private id?: string = createId();
  private projectName: string = faker.lorem.words(2);
  private summary: string = faker.lorem.paragraph();
  private createdAt: Date = faker.date.past();

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withoutId(): this {
    this.id = undefined;
    return this;
  }

  withProjectName(projectName: string): this {
    this.projectName = projectName;
    return this;
  }

  withSummary(summary: string): this {
    this.summary = summary;
    return this;
  }

  withBulletPoints(): this {
    this.summary = [
      "- Completed user authentication module",
      "- Fixed database connection issues",
      "- Added unit tests for core functionality",
      "- Updated documentation",
    ].join("\n");
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  withRandomProject(): this {
    const projects = [
      "ClaudIA",
      "E-commerce Platform",
      "Mobile App",
      "Data Analytics",
      "API Gateway",
      "Microservices",
    ];
    this.projectName = faker.helpers.arrayElement(projects);
    return this;
  }

  recentCheckpoint(): this {
    this.createdAt = faker.date.recent({ days: 7 });
    return this;
  }

  oldCheckpoint(): this {
    this.createdAt = faker.date.past({ years: 1 });
    return this;
  }

  build(): Checkpoint {
    return new Checkpoint(
      this.projectName,
      this.summary,
      this.createdAt,
      this.id
    );
  }
}
