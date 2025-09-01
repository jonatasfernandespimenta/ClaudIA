import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tools } from '../tool-inventory';
import { getPersonalizedPrompt } from '../prompts';
import { logInfo } from '../../utils/logger';
import { BaseAgent } from './base-agent';

export class MainAgent extends BaseAgent {
  constructor() {
    const userName = process.env.USER_NAME;
    const personalizedPrompt = getPersonalizedPrompt(userName);

    super(personalizedPrompt, 'MainAgent');
    
    logInfo('MainAgent', 'Loading user configuration', { 
      hasUserName: !!userName, 
      userName: userName ? `${userName.charAt(0)}***` : 'not set'
    });

    this.setupAgent();
  }

  protected setupAgent(): void {
    logInfo('MainAgent', 'Creating React agent with LangGraph', { toolsCount: tools.length });
    
    this.agent = createReactAgent({
      llm: this.model,
      tools,
    });
  }
}
