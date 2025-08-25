import { CalendarEvent, TimeSlot } from '../../../types/calendar';

export function calculateTimeUsage(events: CalendarEvent[]): number {
  return events.reduce((total, event) => {
    return total + (event.endTime.getTime() - event.startTime.getTime());
  }, 0);
}

export function findFreeTimeSlots(
  events: CalendarEvent[],
  start: Date,
  end: Date,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const sorted = events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  let current = new Date(start);

  for (const event of sorted) {
    if (event.startTime > current) {
      slots.push({ start: new Date(current), end: new Date(event.startTime) });
    }
    if (event.endTime > current) {
      current = new Date(event.endTime);
    }
  }

  if (current < end) {
    slots.push({ start: new Date(current), end: new Date(end) });
  }

  return slots;
}
