import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { Reminder, ReminderStatus } from "../../modules/reminder/domain/entities/reminder";

export class ReminderBuilder {
  private id?: string = createId();
  private message: string = faker.lorem.sentence();
  private status: ReminderStatus = ReminderStatus.PENDING;
  private createdAt: Date = faker.date.past();
  private updatedAt: Date = faker.date.recent();

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withoutId(): this {
    this.id = undefined;
    return this;
  }

  withMessage(message: string): this {
    this.message = message;
    return this;
  }

  withStatus(status: ReminderStatus): this {
    this.status = status;
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  pending(): this {
    this.status = ReminderStatus.PENDING;
    return this;
  }

  inProgress(): this {
    this.status = ReminderStatus.IN_PROGRESS;
    return this;
  }

  completed(): this {
    this.status = ReminderStatus.COMPLETED;
    return this;
  }

  cancelled(): this {
    this.status = ReminderStatus.CANCELLED;
    return this;
  }

  withTaskMessage(): this {
    const tasks = [
      "Complete project documentation",
      "Review pull request #123",
      "Call client about requirements",
      "Update database schema",
      "Deploy to staging environment",
      "Prepare presentation slides",
    ];
    this.message = faker.helpers.arrayElement(tasks);
    return this;
  }

  withMeetingReminder(): this {
    const meetings = [
      "Team standup meeting at 9 AM",
      "Client review meeting at 2 PM",
      "Sprint planning session at 10 AM",
      "Performance review with manager",
      "Architecture discussion meeting",
    ];
    this.message = faker.helpers.arrayElement(meetings);
    return this;
  }

  recentReminder(): this {
    this.createdAt = faker.date.recent({ days: 7 });
    this.updatedAt = faker.date.recent({ days: 3 });
    return this;
  }

  oldReminder(): this {
    this.createdAt = faker.date.past({ years: 1 });
    this.updatedAt = faker.date.past({ years: 0.5 });
    return this;
  }

  build(): Reminder {
    return new Reminder(
      this.message,
      this.status,
      this.createdAt,
      this.updatedAt,
      this.id
    );
  }
}
