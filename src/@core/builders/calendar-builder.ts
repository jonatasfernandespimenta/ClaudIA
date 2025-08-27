import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { Calendar } from "../../modules/calendar/domain/calendar-entity";

export class CalendarBuilder {
  private id?: string = createId();
  private name: string = faker.lorem.words(2);
  private provider: 'google' | 'microsoft' = 'google';
  private accountId: string = createId();

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withoutId(): this {
    this.id = undefined;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withProvider(provider: 'google' | 'microsoft'): this {
    this.provider = provider;
    return this;
  }

  withAccountId(accountId: string): this {
    this.accountId = accountId;
    return this;
  }

  withGoogleProvider(): this {
    this.provider = 'google';
    return this;
  }

  withMicrosoftProvider(): this {
    this.provider = 'microsoft';
    return this;
  }

  withPersonalCalendar(): this {
    this.name = "Personal Calendar";
    return this;
  }

  withWorkCalendar(): this {
    this.name = "Work Calendar";
    return this;
  }

  withTeamCalendar(): this {
    this.name = `${faker.company.name()} Team Calendar`;
    return this;
  }

  withRandomCalendarName(): this {
    const calendarNames = [
      "Personal",
      "Work",
      "Family",
      "Projects",
      "Meetings",
      "Events",
      "Tasks",
      "Holidays",
    ];
    this.name = `${faker.helpers.arrayElement(calendarNames)} Calendar`;
    return this;
  }

  build(): Calendar {
    return new Calendar(
      this.name,
      this.provider,
      this.accountId,
      this.id
    );
  }
}
