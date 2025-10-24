import { checkpointTools } from "./tools/checkpoint-tools";
import { reminderTools } from "./tools/reminder-tools";
import { calendarTools } from "./tools/calendar-tools";
import { utilsTools } from "./tools/utils-tools";
import { boardTools } from "./tools/board-tools";
import { knowledgeTools } from "./tools/knowledge-tools";

export const tools = [
  ...checkpointTools,
  ...reminderTools,
  ...calendarTools,
  ...utilsTools,
  ...boardTools,
  ...knowledgeTools,
];
