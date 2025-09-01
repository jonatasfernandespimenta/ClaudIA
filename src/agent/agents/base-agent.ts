import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { logInfo, logError, logWarn } from '../../utils/logger';

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AgentResult = {
  content: string;
  rawResult?: any;
};

export abstract class BaseAgent {
  protected model: ChatOpenAI;
  protected agent: any;
  protected messages: Message[] = [];
  protected agentType: string;

  constructor(systemPrompt: string, agentType: string, model: string = 'gpt-4o-mini') {
    this.agentType = agentType;
    logInfo(this.agentType, `Initializing OpenAI ChatGPT model`, { model });

    this.model = new ChatOpenAI({
      model,
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];
  }

  protected abstract setupAgent(): void;

  public async invoke(input: string, options: any = {}): Promise<AgentResult> {
    logInfo(this.agentType, 'Received input', { input, messageCount: this.messages.length });
    
    try {
      this.messages.push({ role: 'user', content: input });
      
      logInfo(this.agentType, 'Invoking agent', { recursionLimit: options.recursionLimit || 50 });
      const result: any = await this.agent.invoke({ messages: this.messages }, { recursionLimit: options.recursionLimit || 50 });

      logInfo(this.agentType, 'Agent invocation completed');

      const last = result.messages[result.messages.length - 1] as Message & {
        content: unknown;
      };
      
      logInfo(this.agentType, 'Agent response received', { 
        responseType: typeof last.content,
        messageLength: result.messages.length 
      });
      
      this.messages.push({
        role: 'assistant',
        content: typeof last.content === 'string' ? last.content : '',
      });
      
      if (typeof last.content === 'string') {
        logInfo(this.agentType, 'Returning string response', { responseLength: last.content.length });
        return { content: last.content, rawResult: result };
      }
      
      if (Array.isArray(last.content)) {
        const contentArray = last.content as Array<{ text?: string }>;
        const joinedContent = contentArray.map((part) => part.text ?? '').join('');
        logInfo(this.agentType, 'Returning array-based response', { 
          partsCount: contentArray.length, 
          joinedLength: joinedContent.length 
        });
        return { content: joinedContent, rawResult: result };
      }
      
      logWarn(this.agentType, 'Returning empty response due to unexpected content type');
      return { content: '', rawResult: result };
      
    } catch (error) {
      logError(this.agentType, 'Error processing agent input', error as Error, { input });
      throw error;
    }
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }

  public addMessage(message: Message): void {
    this.messages.push(message);
  }
}
