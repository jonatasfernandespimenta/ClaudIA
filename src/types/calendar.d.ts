export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  source: 'google' | 'microsoft';
  calendarId: string;
  isAllDay: boolean;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface CalendarProvider {
  authenticate(): Promise<void>;
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  findFreeTime(date: Date, duration: number): Promise<TimeSlot[]>;
}
