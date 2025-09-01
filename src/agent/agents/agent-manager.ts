import { logInfo, logError } from '../../utils/logger';
import { MainAgent } from './main-agent';
import { PlanningAgent } from './planning-agent';
import { SummaryAgent } from './summary-agent';
import { Message } from './base-agent';

export class AgentManager {
  private mainAgent: MainAgent;
  private planningAgent: PlanningAgent;
  private summaryAgent: SummaryAgent;
  private conversationMemory: string[] = [];

  constructor() {
    logInfo('AgentManager', 'Initializing agent manager with 3 specialized agents');
    this.mainAgent = new MainAgent();
    this.planningAgent = new PlanningAgent();
    this.summaryAgent = new SummaryAgent();
  }

  public async processUserInput(userInput: string): Promise<string> {
    try {
      logInfo('AgentManager', 'Processing user input', { userInput, memoryLength: this.conversationMemory.length });
      
      const inputWithMemory = this.addMemoryContext(userInput);
      
      logInfo('AgentManager', 'Invoking planning agent');
      const planResult = await this.planningAgent.invoke(inputWithMemory);
      const plan = planResult.content;
      
      logInfo('AgentManager', 'Invoking main agent with plan context');
      const mainAgentInput = `${inputWithMemory}\n\nHere's a plan to approach this request:\n${plan}`;
      const result = await this.mainAgent.invoke(mainAgentInput);
      
      await this.updateConversationMemory();
      
      return result.content;
    } catch (error) {
      logError('AgentManager', 'Error processing user input', error as Error);
      return `I encountered an error while processing your request. Please try again.`;
    }
  }

  private addMemoryContext(userInput: string): string {
    if (this.conversationMemory.length === 0) {
      return userInput;
    }

    const memoryContext = `
Previous conversation context:
${this.conversationMemory.join('\n\n')}

Current request: ${userInput}
`;
    return memoryContext;
  }

  private async updateConversationMemory(): Promise<void> {
    logInfo('AgentManager', 'Updating conversation memory');
    
    const mainAgentMessages = this.mainAgent.getMessages();
    const planningAgentMessages = this.planningAgent.getMessages();
    
    const summary = await this.summaryAgent.summarizeConversation(
      mainAgentMessages,
      planningAgentMessages
    );
    
    this.conversationMemory.push(summary);
    
    if (this.conversationMemory.length > 10) {
      this.conversationMemory.shift();
    }
    
    logInfo('AgentManager', 'Memory updated', { 
      memoryLength: this.conversationMemory.length,
      latestSummaryLength: summary.length
    });
  }

  public getConversationMemory(): string[] {
    return [...this.conversationMemory];
  }
}
