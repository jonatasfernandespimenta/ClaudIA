export enum CalendarProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT'
}

export enum EventStatus {
  CONFIRMED = 'CONFIRMED',
  TENTATIVE = 'TENTATIVE',
  CANCELLED = 'CANCELLED'
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  status: EventStatus;
  provider: CalendarProvider;
  calendarId: string;
  attendees?: CalendarAttendee[];
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}

export interface CalendarInfo {
  id: string;
  name: string;
  description?: string;
  provider: CalendarProvider;
  isPrimary?: boolean;
}

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

export interface EventDuration {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

export interface DayEventsSummary {
  date: Date;
  events: CalendarEvent[];
  totalDuration: EventDuration;
  eventCount: number;
}

export interface WeekEventsSummary {
  startDate: Date;
  endDate: Date;
  daysSummaries: DayEventsSummary[];
  totalEvents: number;
  totalDuration: EventDuration;
}
