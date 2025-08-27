import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { Card } from "../../modules/board/domain/entities/card";

export class CardBuilder {
  private id: string = createId();
  private title: string = faker.lorem.sentence();
  private currentPhase: string = "To Do";
  private description?: string = faker.lorem.paragraph();
  private assignees?: string[] = [faker.person.fullName()];
  private expiresAt?: string = faker.date.future().toISOString();
  private createdAt?: string = faker.date.past().toISOString();

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withCurrentPhase(currentPhase: string): this {
    this.currentPhase = currentPhase;
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

  withAssignees(assignees: string[]): this {
    this.assignees = assignees;
    return this;
  }

  withSingleAssignee(assignee: string): this {
    this.assignees = [assignee];
    return this;
  }

  withMultipleAssignees(): this {
    this.assignees = [
      faker.person.fullName(),
      faker.person.fullName(),
      faker.person.fullName(),
    ];
    return this;
  }

  withoutAssignees(): this {
    this.assignees = undefined;
    return this;
  }

  withExpiresAt(expiresAt: string): this {
    this.expiresAt = expiresAt;
    return this;
  }

  withoutExpiration(): this {
    this.expiresAt = undefined;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  inToDo(): this {
    this.currentPhase = "To Do";
    return this;
  }

  inProgress(): this {
    this.currentPhase = "In Progress";
    return this;
  }

  inReview(): this {
    this.currentPhase = "Review";
    return this;
  }

  done(): this {
    this.currentPhase = "Done";
    return this;
  }

  build(): Card {
    return new Card(
      this.id,
      this.title,
      this.currentPhase,
      this.description,
      this.assignees,
      this.expiresAt,
      this.createdAt
    );
  }
}
