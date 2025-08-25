import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { tools } from './tool-inventory';
import { SYSTEM_PROMPT } from './prompts';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools,
});

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const messages: Message[] = [
  {
    role: 'system',
    content: SYSTEM_PROMPT,
  },
];

export async function askAgent(question: string): Promise<string> {
  messages.push({ role: 'user', content: question });

  const result: any = await agent.invoke({ messages }, { recursionLimit: 50 });

  const last = result.messages[result.messages.length - 1] as Message & {
    content: unknown;
  };

  messages.push({
    role: 'assistant',
    content: typeof last.content === 'string' ? last.content : '',
  });

  if (typeof last.content === 'string') {
    return last.content;
  }

  if (Array.isArray(last.content)) {
    return last.content.map((part: any) => part.text ?? '').join('');
  }

  return '';
}

export default askAgent;

