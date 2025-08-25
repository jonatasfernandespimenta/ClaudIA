import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tool-inventory";
import { SYSTEM_PROMPT } from "./prompts";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools,
});

const result = agent.invoke({
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    {
      role: "user",
      content: "Give me a report about all my events",
    },
  ],
}, { recursionLimit: 50 });
