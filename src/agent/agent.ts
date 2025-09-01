import { logInfo } from '../utils/logger';
import { AgentManager } from './agents/agent-manager';
import { setMemoryAccessFunction } from './tools/utils-tools';

let agentManager: AgentManager | null = null;

function getAgentManager(): AgentManager {
  if (!agentManager) {
    logInfo('Agent', 'Creating new AgentManager instance');
    agentManager = new AgentManager();
  }
  return agentManager;
}

export async function askAgent(question: string): Promise<string> {
  logInfo('Agent', 'Received user question', { question });
  
  const manager = getAgentManager();
  const response = await manager.processUserInput(question);
  
  logInfo('Agent', 'Returning response from AgentManager', { responseLength: response.length });
  return response;
}

export function getConversationMemory(): string[] {
  const manager = getAgentManager();
  return manager.getConversationMemory();
}

setMemoryAccessFunction(getConversationMemory);

export default askAgent;

