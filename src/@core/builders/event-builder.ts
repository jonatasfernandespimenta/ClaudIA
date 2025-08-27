import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { Event } from "../../modules/calendar/domain/event-entity";

export class EventBuilder {
  private id: string = createId();
  private title: string = faker.lorem.words(3);
  private startTime: Date = faker.date.soon();
  private endTime: Date = faker.date.soon();
  private calendarId: string = createId();
  private source: 'google' | 'microsoft' = 'google';
  private description?: string = faker.lorem.paragraph();
  private location?: string = faker.location.streetAddress();
  private attendees?: string[] = [faker.internet.email()];
  private isAllDay: boolean = false;

  constructor() {
    // Ensure end time is after start time
    const start = faker.date.soon();
    this.startTime = start;
    this.endTime = new Date(start.getTime() + faker.number.int({ min: 30, max: 180 }) * 60000); // 30min to 3h later
  }

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withStartTime(startTime: Date): this {
    this.startTime = startTime;
    return this;
  }

  withEndTime(endTime: Date): this {
    this.endTime = endTime;
    return this;
  }

  withTimeRange(startTime: Date, endTime: Date): this {
    this.startTime = startTime;
    this.endTime = endTime;
    return this;
  }

  withCalendarId(calendarId: string): this {
    this.calendarId = calendarId;
    return this;
  }

  withSource(source: 'google' | 'microsoft'): this {
    this.source = source;
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

  withLocation(location: string): this {
    this.location = location;
    return this;
  }

  withoutLocation(): this {
    this.location = undefined;
    return this;
  }

  withAttendees(attendees: string[]): this {
    this.attendees = attendees;
    return this;
  }

  withoutAttendees(): this {
    this.attendees = undefined;
    return this;
  }

  withMultipleAttendees(): this {
    this.attendees = [
      faker.internet.email(),
      faker.internet.email(),
      faker.internet.email(),
    ];
    return this;
  }

  asAllDay(): this {
    this.isAllDay = true;
    // Set times for all-day events
    const date = new Date(this.startTime);
    this.startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    this.endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    return this;
  }

  asRegularEvent(): this {
    this.isAllDay = false;
    return this;
  }

  withGoogleSource(): this {
    this.source = 'google';
    return this;
  }

  withMicrosoftSource(): this {
    this.source = 'microsoft';
    return this;
  }

  withMeetingEvent(): this {
    const meetingTitles = [
      "Team Standup",
      "Sprint Planning",
      "Client Review",
      "Architecture Discussion",
      "Code Review Session",
      "Project Kickoff",
    ];
    this.title = faker.helpers.arrayElement(meetingTitles);
    this.location = "Conference Room A";
    this.withMultipleAttendees();
    return this;
  }

  withPersonalEvent(): this {
    const personalEvents = [
      "Doctor Appointment",
      "Gym Session",
      "Lunch with Friends",
      "Family Dinner",
      "Movie Night",
      "Weekend Trip",
    ];
    this.title = faker.helpers.arrayElement(personalEvents);
    this.withoutAttendees();
    return this;
  }

  oneHourMeeting(): this {
    const start = faker.date.soon();
    this.startTime = start;
    this.endTime = new Date(start.getTime() + 60 * 60000); // 1 hour later
    return this;
  }

  thirtyMinuteMeeting(): this {
    const start = faker.date.soon();
    this.startTime = start;
    this.endTime = new Date(start.getTime() + 30 * 60000); // 30 minutes later
    return this;
  }

  build(): Event {
    return new Event(
      this.id,
      this.title,
      this.startTime,
      this.endTime,
      this.calendarId,
      this.source,
      this.description,
      this.location,
      this.attendees,
      this.isAllDay
    );
  }
}
