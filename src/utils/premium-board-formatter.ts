import { Card } from '../modules/board/domain/entities/card';
import { formatInBrazilTimezone } from './timezone';

export interface BoardDisplayOptions {
  showDescription?: boolean;
  showAssignees?: boolean;
  showDates?: boolean;
  showSource?: boolean;
  compactMode?: boolean;
}

export class PremiumBoardFormatter {
  // Emojis para status/fases
  private static getPhaseEmoji(phase: string): string {
    const lowerPhase = phase.toLowerCase();
    
    if (lowerPhase.includes('backlog') || lowerPhase.includes('aguardando')) {
      return '📋';
    } else if (lowerPhase.includes('andamento') || lowerPhase.includes('progress')) {
      return '⏳';
    } else if (lowerPhase.includes('review') || lowerPhase.includes('revisão')) {
      return '👀';
    } else if (lowerPhase.includes('done') || lowerPhase.includes('concluído') || lowerPhase.includes('concluido')) {
      return '✅';
    } else if (lowerPhase.includes('blocked') || lowerPhase.includes('bloqueado')) {
      return '🚫';
    } else if (lowerPhase.includes('dev') || lowerPhase.includes('development')) {
      return '👨‍💻';
    } else if (lowerPhase.includes('test') || lowerPhase.includes('teste')) {
      return '🧪';
    } else if (lowerPhase.includes('deploy') || lowerPhase.includes('release')) {
      return '🚀';
    }
    
    return '📌';
  }

  // Formatar título com texto em negrito estilizado (Unicode Bold)
  private static formatTitle(title: string): string {
    return title.replace(/[A-Za-z]/g, char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // A-Z
        return String.fromCharCode(code - 65 + 0x1D5D4); // Mathematical Sans-Serif Bold A-Z
      }
      if (code >= 97 && code <= 122) { // a-z
        return String.fromCharCode(code - 97 + 0x1D5EE); // Mathematical Sans-Serif Bold a-z
      }
      return char;
    });
  }

  // Obter emoji para a fonte/provedor
  private static getSourceEmoji(source: string): string {
    const sourceMap: { [key: string]: string } = {
      'pipefy': '🟣',
      'shortcut': '🔵',
      'jira': '🔷',
      'trello': '🔹',
      'asana': '🟠'
    };
    
    return sourceMap[source.toLowerCase()] || '📊';
  }

  // Formatar data relativa
  private static formatRelativeDate(date: Date | null | undefined): string {
    if (!date) return '';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    if (days === -1) return 'Ontem';
    
    if (days > 0) {
      if (days <= 7) return `Em ${days} dias`;
      if (days <= 30) return `Em ${Math.floor(days / 7)} semanas`;
      return formatInBrazilTimezone(date, 'dd/MM/yyyy');
    } else {
      const absDays = Math.abs(days);
      if (absDays <= 7) return `Há ${absDays} dias`;
      if (absDays <= 30) return `Há ${Math.floor(absDays / 7)} semanas`;
      return formatInBrazilTimezone(date, 'dd/MM/yyyy');
    }
  }

  // Criar cabeçalho para quadro de tarefas
  private static createBoardHeader(title: string): string {
    const totalWidth = Math.max(55, title.length + 6);
    const padding = Math.floor((totalWidth - title.length) / 2);
    const headerTitle = '━'.repeat(padding) + ` ${title} ` + '━'.repeat(totalWidth - padding - title.length - 2);
    
    return [
      `┏${headerTitle}┓`,
      `┗${'━'.repeat(totalWidth)}┛`
    ].join('\n');
  }

  // Formatar uma única tarefa
  private static formatSingleCard(
    card: Card,
    options: BoardDisplayOptions
  ): string[] {
    const lines: string[] = [];
    
    const phaseEmoji = this.getPhaseEmoji(card.currentPhase || '');
    const titleStr = this.formatTitle(card.title);
    const sourceStr = options.showSource !== false ? 
      `${this.getSourceEmoji('')}` : '';
    
    // Linha principal da tarefa
    lines.push(`┃  ${phaseEmoji} ${titleStr}  ${sourceStr}`);
    
    // ID da tarefa
    lines.push(`┃     🔖 ${card.id}`);
    
    // Fase atual
    lines.push(`┃     📍 ${card.currentPhase || 'Sem fase'}`);
    
    // Descrição (se disponível)
    if (card.description && options.showDescription !== false) {
      // Limitar descrição a uma linha para manter elegância
      const desc = card.description.length > 50 ? 
        card.description.substring(0, 47) + '...' : 
        card.description;
      lines.push(`┃     📝 ${desc}`);
    }
    
    // Responsáveis (se disponível)
    if (card.assignees && card.assignees.length > 0 && options.showAssignees !== false) {
      const assigneesStr = card.assignees.join(', ');
      lines.push(`┃     👤 ${assigneesStr}`);
    }
    
    // Data de expiração (se disponível)
    if (card.expiresAt && options.showDates !== false) {
      const expirationStr = this.formatRelativeDate(new Date(card.expiresAt));
      lines.push(`┃     ⏰ Expira: ${expirationStr}`);
    }
    
    return lines;
  }

  // Formatar múltiplas tarefas
  public static formatCards(
    cards: Card[],
    title: string = '📋 Tarefas',
    options: BoardDisplayOptions = {}
  ): string {
    if (cards.length === 0) {
      const header = this.createBoardHeader(title);
      return [
        header,
        '┃',
        '┃  📭 Nenhuma tarefa encontrada',
        '┃',
        '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
        '',
        '─ Não há tarefas neste quadro ou fase. Tempo para criar algo novo?'
      ].join('\n');
    }

    const result: string[] = [];
    const header = this.createBoardHeader(title);
    result.push(header);
    
    // Ordenar tarefas por fase e depois por data
    const sortedCards = [...cards].sort((a, b) => {
      if (a.currentPhase && b.currentPhase) {
        if (a.currentPhase !== b.currentPhase) {
          return a.currentPhase.localeCompare(b.currentPhase);
        }
      }
      
      const dateA = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
      const dateB = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
      
      if (dateA && dateB) {
        return dateA - dateB;
      }
      
      return 0;
    });

    // Agrupar tarefas por fase
    const cardsByPhase: { [phase: string]: Card[] } = {};
    sortedCards.forEach(card => {
      const phase = card.currentPhase || 'Sem fase';
      if (!cardsByPhase[phase]) {
        cardsByPhase[phase] = [];
      }
      cardsByPhase[phase].push(card);
    });

    // Iterar pelas fases para exibir tarefas agrupadas
    let isFirstPhase = true;
    for (const [phase, phaseCards] of Object.entries(cardsByPhase)) {
      if (!isFirstPhase) {
        result.push('┃');
        result.push(`┃  ${this.getPhaseEmoji(phase)} ${phase}`);
        result.push('┃  ' + '─'.repeat(53));
      } else {
        result.push('┃');
        result.push(`┃  ${this.getPhaseEmoji(phase)} ${phase}`);
        result.push('┃  ' + '─'.repeat(53));
        isFirstPhase = false;
      }
      
      phaseCards.forEach((card, index) => {
        const cardLines = this.formatSingleCard(card, options);
        result.push('┃');
        result.push(...cardLines);
        
        // Não adicionar linha em branco após o último card da fase
        if (index < phaseCards.length - 1) {
          result.push('┃');
        }
      });
    }

    result.push('┃');
    result.push('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
    
    // Resumo
    result.push('');
    const phasesCount = Object.keys(cardsByPhase).length;
    result.push(`─ Resumo: ${cards.length} ${cards.length === 1 ? 'tarefa' : 'tarefas'} em ${phasesCount} ${phasesCount === 1 ? 'fase' : 'fases'}`);
    result.push('  Ação: quer que eu mova alguma tarefa ou crie uma nova?');

    return result.join('\n');
  }

  // Formatar tarefas por responsável
  public static formatCardsByAssignee(
    cards: Card[],
    assignee: string,
    options: BoardDisplayOptions = {}
  ): string {
    const title = `👤 Tarefas de ${assignee}`;
    return this.formatCards(cards, title, options);
  }

  // Formatar tarefas por fonte/provedor
  public static formatCardsBySource(
    cards: Card[],
    source: string,
    options: BoardDisplayOptions = {}
  ): string {
    const emoji = this.getSourceEmoji(source);
    const title = `${emoji} Tarefas do ${source}`;
    return this.formatCards(cards, title, options);
  }

  // Formatar resumo rápido de tarefas
  public static formatCardsSummary(cards: Card[]): string {
    if (cards.length === 0) {
      return '📋 Nenhuma tarefa • Quadro vazio!';
    }

    // Contar tarefas por fase
    const phaseCount: { [phase: string]: number } = {};
    cards.forEach(card => {
      const phase = card.currentPhase || 'Sem fase';
      phaseCount[phase] = (phaseCount[phase] || 0) + 1;
    });

    // Encontrar a fase com mais tarefas
    let topPhase = '';
    let topCount = 0;
    for (const [phase, count] of Object.entries(phaseCount)) {
      if (count > topCount) {
        topPhase = phase;
        topCount = count;
      }
    }

    const emoji = this.getPhaseEmoji(topPhase);
    return `📋 ${cards.length} ${cards.length === 1 ? 'tarefa' : 'tarefas'} • Mais em: ${emoji} ${topPhase} (${topCount})`;
  }
}
