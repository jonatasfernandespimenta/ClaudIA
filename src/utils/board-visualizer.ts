import * as blessed from 'blessed';
import { Board } from '../modules/board/domain/entities/board';
import { Card } from '../modules/board/domain/entities/card';

export interface BoardVisualizationOptions {
  width?: number;
  height?: number;
  title?: string;
  showAssignees?: boolean;
  maxCardsPerPhase?: number;
}

export class BoardVisualizer {
  /**
   * Cria uma visualização de board no terminal usando blessed
   */
  static createBoardVisualization(
    board: Board, 
    cards: Card[], 
    options: BoardVisualizationOptions = {}
  ): any {
    const {
      width = 100,
      height = 30,
      title = board.title,
      showAssignees = true,
      maxCardsPerPhase = 5
    } = options;

    // Container principal do board
    const boardContainer = blessed.box({
      width,
      height,
      border: {
        type: 'line',
        fg: 6 // cyan
      },
      label: ` 📋 ${title} `,
      scrollable: true,
      mouse: true,
      keys: true,
      vi: true
    });

    // Organizar cards por fase
    const cardsByPhase = this.organizeCardsByPhase(cards, board.phases);

    // Calcular largura de cada coluna
    const columnWidth = Math.floor((width - 4 - (board.phases.length - 1)) / board.phases.length);
    
    // Criar colunas para cada fase
    board.phases.forEach((phase, index) => {
      const phaseCards = cardsByPhase[phase] || [];
      const left = 1 + (index * (columnWidth + 1));
      
      // Container da fase
      const phaseContainer = blessed.box({
        parent: boardContainer,
        top: 1,
        left,
        width: columnWidth,
        height: height - 4,
        border: {
          type: 'line',
          fg: 3 // yellow
        },
        label: ` ${phase} (${phaseCards.length}) `,
        scrollable: true
      });

      // Adicionar cards na fase
      let cardTop = 1;
      const displayCards = phaseCards.slice(0, maxCardsPerPhase);
      
      displayCards.forEach((card, cardIndex) => {
        const cardHeight = this.calculateCardHeight(card, showAssignees, columnWidth);
        
        const cardElement = this.createCardElement({
          card,
          parent: phaseContainer,
          top: cardTop,
          width: columnWidth - 2,
          height: cardHeight,
          showAssignees,
          index: cardIndex
        });

        cardTop += cardHeight + 1;
      });

      // Mostrar indicador se há mais cards
      if (phaseCards.length > maxCardsPerPhase) {
        blessed.box({
          parent: phaseContainer,
          top: cardTop,
          left: 1,
          width: columnWidth - 4,
          height: 1,
          content: `{center}{dim}... e mais ${phaseCards.length - maxCardsPerPhase} cards{/center}`,
          tags: true,
          style: {
            fg: 'gray'
          }
        });
      }
    });

    return boardContainer;
  }

  /**
   * Cria um elemento de card individual
   */
  private static createCardElement(options: {
    card: Card;
    parent: any;
    top: number;
    width: number;
    height: number;
    showAssignees: boolean;
    index: number;
  }): any {
    const { card, parent, top, width, height, showAssignees, index } = options;
    
    // Cores alternadas para os cards (usando números para blessed)
    const cardColors = [7, 2, 4, 5, 6]; // white, green, blue, magenta, cyan
    const borderColor = cardColors[index % cardColors.length];
    
    const cardElement = blessed.box({
      parent,
      top,
      left: 1,
      width,
      height,
      border: {
        type: 'line',
        fg: borderColor
      },
      padding: {
        left: 1,
        right: 1,
        top: 0,
        bottom: 0
      },
      tags: true,
      mouse: true
    });

    // Conteúdo do card
    let content = `{bold}${this.truncateText(card.title, width - 4)}{/bold}`;
    
    if (card.description) {
      content += `\n{dim}${this.truncateText(card.description, width - 4)}{/dim}`;
    }
    
    if (showAssignees && card.assignees && card.assignees.length > 0) {
      const assigneeText = card.assignees.slice(0, 2).join(', ');
      const truncatedAssignees = this.truncateText(assigneeText, width - 6);
      content += `\n{yellow-fg}👤 ${truncatedAssignees}{/yellow-fg}`;
      
      if (card.assignees.length > 2) {
        content += `{dim} +${card.assignees.length - 2}{/dim}`;
      }
    }
    
    if (card.expiresAt) {
      const dueDate = new Date(card.expiresAt).toLocaleDateString('pt-BR');
      content += `\n{red-fg}📅 ${dueDate}{/red-fg}`;
    }

    cardElement.setContent(content);

    // Tooltip com informações completas do card
    cardElement.on('click', () => {
      this.showCardDetails(card);
    });

    return cardElement;
  }

  /**
   * Organiza cards por fase
   */
  private static organizeCardsByPhase(cards: Card[], phases: string[]): Record<string, Card[]> {
    const cardsByPhase: Record<string, Card[]> = {};
    
    // Inicializar todas as fases
    phases.forEach(phase => {
      cardsByPhase[phase] = [];
    });
    
    // Organizar cards nas fases
    cards.forEach(card => {
      if (cardsByPhase[card.currentPhase]) {
        cardsByPhase[card.currentPhase].push(card);
      }
    });
    
    return cardsByPhase;
  }

  /**
   * Calcula altura necessária para um card
   */
  private static calculateCardHeight(card: Card, showAssignees: boolean, width: number): number {
    let lines = 1; // Título
    
    if (card.description) lines += 1; // Descrição
    if (showAssignees && card.assignees && card.assignees.length > 0) lines += 1; // Assignees
    if (card.expiresAt) lines += 1; // Data de vencimento
    
    return Math.max(3, lines + 2); // Mínimo de 3, +2 para padding
  }

  /**
   * Trunca texto para caber na largura especificada
   */
  private static truncateText(text: string, maxWidth: number): string {
    if (text.length <= maxWidth) return text;
    return text.substring(0, maxWidth - 3) + '...';
  }

  /**
   * Mostra detalhes completos do card em uma popup modal
   */
  private static showCardDetails(card: Card): void {
    // Obter a tela principal (screen)
    const screen = (global as any).claudiaScreen;
    if (!screen) {
      // Fallback: mostrar detalhes no console de forma organizada
      this.showCardDetailsInConsole(card);
      return;
    }

    // Criar popup modal
    const popup = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '85%',
      height: '85%',
      border: {
        type: 'line'
      },
      label: ' 📋 Detalhes do Card ',
      padding: {
        left: 2,
        right: 2,
        top: 1,
        bottom: 1
      },
      tags: true,
      mouse: true,
      keys: true,
      scrollable: true,
      alwaysScroll: true,
      style: {
        bg: 'black',
        fg: 'white',
        border: {
          fg: 'cyan'
        }
      },
      shadow: true
    });

    // Formatar conteúdo do card
    let content = `{bold}{cyan-fg}📝 Título:{/cyan-fg}{/bold}\n${card.title || 'Sem título'}\n\n`;
    
    if (card.description) {
      content += `{bold}{cyan-fg}📄 Descrição:{/cyan-fg}{/bold}\n${card.description}\n\n`;
    }
    
    content += `{bold}{cyan-fg}⚡ Fase Atual:{/cyan-fg}{/bold}\n${card.currentPhase}\n\n`;
    
    if (card.assignees && card.assignees.length > 0) {
      content += `{bold}{cyan-fg}👥 Responsáveis ({${card.assignees.length}}):{/cyan-fg}{/bold}\n`;
      card.assignees.forEach(assignee => {
        content += `  • ${assignee}\n`;
      });
      content += '\n';
    }
    
    if (card.expiresAt) {
      const dueDate = new Date(card.expiresAt);
      const now = new Date();
      const isOverdue = dueDate < now;
      const formattedDate = dueDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const statusColor = isOverdue ? 'red' : 'yellow';
      const statusIcon = isOverdue ? '⚠️' : '📅';
      content += `{bold}{${statusColor}-fg}${statusIcon} Prazo:{/${statusColor}-fg}{/bold}\n${formattedDate} às ${formattedTime}`;
      if (isOverdue) {
        content += ` {red-fg}(ATRASADO){/red-fg}`;
      }
      content += '\n\n';
    }
    
    if (card.createdAt) {
      const createdDate = new Date(card.createdAt);
      const formattedCreated = createdDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedCreatedTime = createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      content += `{bold}{green-fg}✨ Criado em:{/green-fg}{/bold}\n${formattedCreated} às ${formattedCreatedTime}\n\n`;
    }
    
    content += `{bold}{yellow-fg}🆔 ID:{/yellow-fg}{/bold} {dim}${card.id}{/dim}\n\n`;
    
    // Instruções de navegação
    content += `{center}{dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/dim}{/center}\n`;
    content += `{center}{dim}ESC ou Q para fechar • ↑↓ para navegar • Mouse para scroll{/dim}{/center}`;
    
    popup.setContent(content);

    // Adicionar botão de fechar estilizado
    const closeButton = blessed.button({
      parent: popup,
      bottom: 2,
      right: 3,
      width: 10,
      height: 3,
      content: ' Fechar ',
      style: {
        bg: 'red',
        fg: 'white',
        focus: {
          bg: 'brightred',
          fg: 'white'
        },
        hover: {
          bg: 'brightred'
        }
      },
      mouse: true,
      border: {
        type: 'line'
      }
    });

    // Variável para controlar se o popup ainda está ativo
    let popupActive = true;
    
    // Eventos para fechar o popup
    const closePopup = () => {
      if (!popupActive) return;
      popupActive = false;
      
      try {
        popup.destroy();
        screen.render();
      } catch (error) {
        // Ignore erros de destroy
      }
    };

    // Fechar com ESC ou Q
    popup.key(['escape', 'q', 'C-c'], closePopup);
    
    // Fechar com clique no botão
    closeButton.on('press', closePopup);
    
    // Fechar com Enter quando o botão estiver focado
    closeButton.key(['enter', 'space'], closePopup);
    
    // Navegação com tab entre popup e botão
    popup.key(['tab'], () => {
      closeButton.focus();
    });
    
    closeButton.key(['tab'], () => {
      popup.focus();
    });

    // Focar no popup inicialmente
    popup.focus();
    screen.render();
  }
  
  /**
   * Versão alternativa para mostrar detalhes no console quando não há tela disponível
   */
  private static showCardDetailsInConsole(card: Card): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 DETALHES DO CARD');
    console.log('='.repeat(60));
    
    console.log(`\n📝 Título: ${card.title || 'Sem título'}`);
    
    if (card.description) {
      console.log(`\n📄 Descrição:\n${card.description}`);
    }
    
    console.log(`\n⚡ Fase Atual: ${card.currentPhase}`);
    
    if (card.assignees && card.assignees.length > 0) {
      console.log(`\n👥 Responsáveis (${card.assignees.length}):`);
      card.assignees.forEach(assignee => {
        console.log(`  • ${assignee}`);
      });
    }
    
    if (card.expiresAt) {
      const dueDate = new Date(card.expiresAt);
      const now = new Date();
      const isOverdue = dueDate < now;
      const formattedDate = dueDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      console.log(`\n📅 Prazo: ${formattedDate} às ${formattedTime}${isOverdue ? ' (ATRASADO)' : ''}`);
    }
    
    if (card.createdAt) {
      const createdDate = new Date(card.createdAt);
      const formattedCreated = createdDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedCreatedTime = createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      console.log(`\n✨ Criado em: ${formattedCreated} às ${formattedCreatedTime}`);
    }
    
    console.log(`\n🆔 ID: ${card.id}`);
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Cria uma visualização simplificada de board para exibir no chat
   */
  static createSimpleBoardText(board: Board, cards: Card[]): string {
    const cardsByPhase = this.organizeCardsByPhase(cards, board.phases);
    
    let result = `📋 **${board.title}**\n\n`;
    
    board.phases.forEach(phase => {
      const phaseCards = cardsByPhase[phase] || [];
      result += `**${phase}** (${phaseCards.length} cards)\n`;
      
      if (phaseCards.length === 0) {
        result += `  {dim}└─ Nenhum card{/dim}\n`;
      } else {
        phaseCards.slice(0, 3).forEach((card, index) => {
          const isLast = index === phaseCards.length - 1 || index === 2;
          const connector = isLast ? '└─' : '├─';
          const assigneeInfo = card.assignees && card.assignees.length > 0 
            ? ` (👤 ${card.assignees[0]}${card.assignees.length > 1 ? ` +${card.assignees.length - 1}` : ''})`
            : '';
          
          result += `  {green-fg}${connector}{/green-fg} ${card.title}${assigneeInfo}\n`;
        });
        
        if (phaseCards.length > 3) {
          result += `  {dim}└─ ... e mais ${phaseCards.length - 3} cards{/dim}\n`;
        }
      }
      result += '\n';
    });
    
    return result;
  }
}
