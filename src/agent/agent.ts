import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { tools } from './tool-inventory';
import { SYSTEM_PROMPT } from './prompts';
import { logInfo, logError, logWarn } from '../utils/logger';

logInfo('Agent', 'Initializing OpenAI ChatGPT model', { model: 'gpt-4o-mini' });

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
});

logInfo('Agent', 'Creating React agent with LangGraph', { toolsCount: tools.length });

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
  logInfo('Agent', 'Received user question', { question, messageCount: messages.length });
  
  try {
    messages.push({ role: 'user', content: question });
    
    logInfo('Agent', 'Invoking agent with LangGraph', { recursionLimit: 50 });
    const result: any = await agent.invoke({ messages }, { recursionLimit: 50 });

    logInfo('Agent', 'Agent invocation completed', { result });

    const last = result.messages[result.messages.length - 1] as Message & {
      content: unknown;
    };
    
    logInfo('Agent', 'Agent response received', { 
      responseType: typeof last.content,
      messageLength: result.messages.length 
    });
    
    messages.push({
      role: 'assistant',
      content: typeof last.content === 'string' ? last.content : '',
    });
    
    if (typeof last.content === 'string') {
      logInfo('Agent', 'Returning string response', { responseLength: last.content.length });
      return last.content;
    }
    
    if (Array.isArray(last.content)) {
      const contentArray = last.content as Array<{ text?: string }>;
      const joinedContent = contentArray.map((part) => part.text ?? '').join('');
      logInfo('Agent', 'Returning array-based response', { 
        partsCount: contentArray.length, 
        joinedLength: joinedContent.length 
      });
      return joinedContent;
    }
    
    logWarn('Agent', 'Returning empty response due to unexpected content type');
    return '';
    
  } catch (error) {
    logError('Agent', 'Error processing agent question', error as Error, { question });
    throw error;
  }
}

export default askAgent;

