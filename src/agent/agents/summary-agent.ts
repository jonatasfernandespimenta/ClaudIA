import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { logInfo } from '../../utils/logger';
import { BaseAgent, Message } from './base-agent';

const SUMMARY_PROMPT = `# ClaudIA Summarization Agent

You are the Summarization Agent for ClaudIA, an intelligent productivity assistant.

## Your Role
Your specific role is to create concise summaries of conversations, capturing key information, tool results, and decisions made during interactions.

## Core Responsibilities
1. Identify and extract the most important information from conversations
2. Summarize user requests clearly and concisely
3. Record the results of tool calls and their outcomes
4. Note any decisions made or conclusions reached
5. Create compact, information-dense summaries that can be used as short-term memory

## Communication Style
- Be extremely concise and information-dense
- Focus on facts and concrete information
- Prioritize actionable items and key decisions
- Use bullet points for better readability
- Avoid unnecessary details or explanations

## Output Format

Your summary should follow this structure:

**USER REQUEST:** [One sentence describing what the user asked for]

**ACTIONS TAKEN:**
- [Tool used and result]
- [Decision made]
- [Information provided]

**KEY INFORMATION:**
- [Important fact or data point]
- [Status update]
- [Relevant context]

Keep your summaries under 150 words. They will be used as short-term memory for future interactions, so include only the most essential information that would be useful for continuing the conversation.`;

export class SummaryAgent extends BaseAgent {
  constructor() {
    super(SUMMARY_PROMPT, 'SummaryAgent');
    this.setupAgent();
  }

  protected setupAgent(): void {
    logInfo('SummaryAgent', 'Creating React summarization agent with LangGraph');
    
    this.agent = createReactAgent({
      llm: this.model,
      tools: [],
    });
  }

  public async summarizeConversation(mainAgentMessages: Message[], planningAgentMessages: Message[]): Promise<string> {
    const conversationToSummarize = this.formatConversationForSummary(mainAgentMessages, planningAgentMessages);
    
    logInfo('SummaryAgent', 'Summarizing conversation', { 
      mainMessagesCount: mainAgentMessages.length,
      planningMessagesCount: planningAgentMessages.length
    });

    const result = await this.invoke(conversationToSummarize);
    return result.content;
  }

  private formatConversationForSummary(mainAgentMessages: Message[], planningAgentMessages: Message[]): string {
    let summary = "Please summarize the following conversation:\n\n";
    
    summary += "## Main Agent Conversation\n";
    mainAgentMessages.forEach((msg, index) => {
      if (msg.role !== 'system') {
        summary += `${msg.role.toUpperCase()}: ${msg.content.substring(0, 300)}${msg.content.length > 300 ? '...' : ''}\n\n`;
      }
    });
    
    if (planningAgentMessages.length > 1) {
      summary += "## Planning Agent Output\n";
      const lastPlanningMessage = planningAgentMessages.filter(msg => msg.role === 'assistant').pop();
      if (lastPlanningMessage) {
        summary += `${lastPlanningMessage.content.substring(0, 300)}${lastPlanningMessage.content.length > 300 ? '...' : ''}\n\n`;
      }
    }
    
    return summary;
  }
}
