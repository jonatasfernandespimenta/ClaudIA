import * as blessed from 'blessed';
import { Reminder, ReminderStatus } from '../modules/reminder/domain/entities/reminder';

export interface ReminderBoardOptions {
  width?: number;
  height?: number;
  title?: string;
  showDates?: boolean;
  maxRemindersPerColumn?: number;
  groupByStatus?: boolean;
}

export interface RemindersByStatus {
  status: ReminderStatus;
  displayName: string;
  reminders: Reminder[];
  color: number;
  icon: string;
}

export class ReminderBoardVisualizer {
  /**
   * Cria uma visualização de board de reminders no terminal usando blessed
   */
  static createReminderBoardVisualization(
    reminders: Reminder[], 
    options: ReminderBoardOptions = {}
  ): any {
    const {
      width = 120,
      height = 30,
      title = 'Reminders',
      showDates = true,
      maxRemindersPerColumn = 8,
      groupByStatus = true
    } = options;

    // Organizar reminders por status
    const remindersByStatus = this.organizeRemindersByStatus(reminders);

    // Determinar título dinâmico baseado na quantidade
    const boardTitle = this.generateBoardTitle(reminders, title);

    // Container principal do board de reminders
    const boardContainer = blessed.box({
      width,
      height,
      border: {
        type: 'line',
        fg: 6 // cyan
      },
      label: ` 📝 ${boardTitle} `,
      scrollable: true,
      mouse: true,
      keys: true,
      vi: true
    });

    // Se não há reminders
    if (reminders.length === 0) {
      const emptyMessage = blessed.box({
        parent: boardContainer,
        top: 'center',
        left: 'center',
        width: 50,
        height: 7,
        content: '{center}📭 Nenhum reminder encontrado\n\nCrie um novo reminder\n\n💡 Use "create reminder" para adicionar{/center}',
        tags: true,
        style: {
          fg: 'gray'
        }
      });
      return boardContainer;
    }

    // Filtrar apenas grupos com reminders
    const activeGroups = remindersByStatus.filter(group => group.reminders.length > 0);
    
    // Calcular largura de cada coluna
    const columnWidth = Math.floor((width - 4 - (activeGroups.length - 1)) / activeGroups.length);
    
    // Criar colunas para cada status
    activeGroups.forEach((statusGroup, index) => {
      const left = 1 + (index * (columnWidth + 1));
      
      // Container do status
      const statusContainer = blessed.box({
        parent: boardContainer,
        top: 1,
        left,
        width: columnWidth,
        height: height - 4,
        border: {
          type: 'line',
          fg: statusGroup.color
        },
        label: ` ${statusGroup.icon} ${statusGroup.displayName} (${statusGroup.reminders.length}) `,
        scrollable: true
      });

      // Adicionar reminders na coluna
      let reminderTop = 1;
      const displayReminders = statusGroup.reminders.slice(0, maxRemindersPerColumn);
      
      displayReminders.forEach((reminder, reminderIndex) => {
        const reminderHeight = this.calculateReminderHeight(reminder, showDates, columnWidth);
        
        const reminderElement = this.createReminderElement({
          reminder,
          parent: statusContainer,
          top: reminderTop,
          width: columnWidth - 2,
          height: reminderHeight,
          showDates,
          statusColor: statusGroup.color,
          statusIcon: statusGroup.icon,
          index: reminderIndex
        });

        reminderTop += reminderHeight + 1;
      });

      // Mostrar indicador se há mais reminders
      if (statusGroup.reminders.length > maxRemindersPerColumn) {
        blessed.box({
          parent: statusContainer,
          top: reminderTop,
          left: 1,
          width: columnWidth - 4,
          height: 1,
          content: `{center}... e mais ${statusGroup.reminders.length - maxRemindersPerColumn} reminders{/center}`,
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
   * Cria um elemento de reminder individual (card)
   */
  private static createReminderElement(options: {
    reminder: Reminder;
    parent: any;
    top: number;
    width: number;
    height: number;
    showDates: boolean;
    statusColor: number;
    statusIcon: string;
    index: number;
  }): any {
    const { reminder, parent, top, width, height, showDates, statusColor, statusIcon, index } = options;
    
    // Cores alternadas para os cards (baseado no status principal)
    const cardColors = [statusColor, 7, 2, 4, 5]; // status color, white, green, blue, magenta
    const borderColor = cardColors[index % cardColors.length];
    
    const reminderElement = blessed.box({
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
      mouse: true,
      style: {
        hover: {
          bg: 'gray'
        }
      }
    });

    // Conteúdo do card
    let content = `{bold}${this.truncateText(reminder.message, width - 4)}{/bold}`;
    
    // Mostrar data de criação
    if (showDates) {
      const dateStr = this.formatReminderDate(reminder.createdAt);
      content += `\n{cyan-fg}📅 ${dateStr}{/cyan-fg}`;
    }
    
    // ID do reminder (últimos 6 caracteres)
    const shortId = reminder.id ? reminder.id.slice(-6) : 'N/A';
    content += `\n#${shortId}`;

    // Se foi atualizada recentemente, mostrar
    if (reminder.updatedAt.getTime() !== reminder.createdAt.getTime()) {
      const updatedStr = this.formatReminderDate(reminder.updatedAt);
      content += `\n🔄 ${updatedStr}`;
    }

    reminderElement.setContent(content);

    // Click para mostrar detalhes
    reminderElement.on('click', () => {
      this.showReminderDetails(reminder);
    });

    return reminderElement;
  }

  /**
   * Organiza reminders por status
   */
  private static organizeRemindersByStatus(reminders: Reminder[]): RemindersByStatus[] {
    const statusConfig = [
      {
        status: ReminderStatus.PENDING,
        displayName: 'Pendentes',
        color: 3, // yellow
        icon: '⏳'
      },
      {
        status: ReminderStatus.IN_PROGRESS,
        displayName: 'Em Progresso',
        color: 4, // blue
        icon: '🔄'
      },
      {
        status: ReminderStatus.COMPLETED,
        displayName: 'Concluídos',
        color: 2, // green
        icon: '✅'
      },
      {
        status: ReminderStatus.CANCELLED,
        displayName: 'Cancelados',
        color: 1, // red
        icon: '❌'
      }
    ];

    return statusConfig.map(config => {
      const statusReminders = reminders
        .filter(reminder => reminder.status === config.status)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Mais recentes primeiro

      return {
        ...config,
        reminders: statusReminders
      };
    });
  }

  /**
   * Gera título dinâmico do board baseado na quantidade
   */
  private static generateBoardTitle(reminders: Reminder[], baseTitle: string): string {
    if (reminders.length === 0) {
      return `${baseTitle} - Nenhum encontrado`;
    }
    
    if (reminders.length === 1) {
      return `${baseTitle} - 1 reminder`;
    }
    
    return `${baseTitle} - ${reminders.length} reminders`;
  }

  /**
   * Formatar data para exibição
   */
  private static formatReminderDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const reminderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (reminderDate.getTime() === today.getTime()) {
      return `Hoje ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (reminderDate.getTime() === yesterday.getTime()) {
      return `Ontem ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Calcular diferença em dias
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return `${weekdays[date.getDay()]} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calcula altura necessária para um reminder
   */
  private static calculateReminderHeight(
    reminder: Reminder, 
    showDates: boolean, 
    width: number
  ): number {
    let lines = 1; // Mensagem
    
    if (showDates) lines += 1; // Data de criação
    lines += 1; // ID
    
    if (reminder.updatedAt.getTime() !== reminder.createdAt.getTime()) {
      lines += 1; // Data de atualização
    }
    
    return Math.max(4, lines + 2); // Mínimo de 4, +2 para padding
  }

  /**
   * Trunca texto para caber na largura especificada
   */
  private static truncateText(text: string, maxWidth: number): string {
    if (text.length <= maxWidth) return text;
    return text.substring(0, maxWidth - 3) + '...';
  }

  /**
   * Mostra detalhes completos do reminder em uma popup modal
   */
  private static showReminderDetails(reminder: Reminder): void {
    // Obter a tela principal (screen)
    const screen = (global as any).claudiaScreen;
    if (!screen) {
      this.showReminderDetailsInConsole(reminder);
      return;
    }

    // Criar popup modal
    const popup = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '70%',
      height: '70%',
      border: {
        type: 'line',
        fg: 6 // cyan
      },
      label: ' 📝 Detalhes do Reminder ',
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
        fg: 'white'
      },
      shadow: true
    });

    // Status config para cores e ícones
    const statusConfig: Record<ReminderStatus, { color: string; icon: string; name: string }> = {
      [ReminderStatus.PENDING]: { color: 'yellow', icon: '⏳', name: 'Pendente' },
      [ReminderStatus.IN_PROGRESS]: { color: 'blue', icon: '🔄', name: 'Em Progresso' },
      [ReminderStatus.COMPLETED]: { color: 'green', icon: '✅', name: 'Concluído' },
      [ReminderStatus.CANCELLED]: { color: 'red', icon: '❌', name: 'Cancelado' }
    };

    const config = statusConfig[reminder.status];
    
    // Formatar conteúdo do reminder
    let content = `{bold}{cyan-fg}📝 Mensagem:{/cyan-fg}{/bold}\n${reminder.message}\n\n`;
    
    content += `{bold}{cyan-fg}📊 Status:{/cyan-fg}{/bold}\n{${config.color}-fg}${config.icon} ${config.name}{/${config.color}-fg}\n\n`;
    
    content += `{bold}{cyan-fg}🆔 ID:{/cyan-fg}{/bold}\n${reminder.id}\n\n`;
    
    content += `{bold}{cyan-fg}📅 Criado em:{/cyan-fg}{/bold}\n${reminder.createdAt.toLocaleString('pt-BR')}\n\n`;
    
    if (reminder.updatedAt.getTime() !== reminder.createdAt.getTime()) {
      content += `{bold}{cyan-fg}🔄 Atualizado em:{/cyan-fg}{/bold}\n${reminder.updatedAt.toLocaleString('pt-BR')}\n\n`;
    }
    
    // Instruções de navegação
    content += `{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}\n`;
    content += `{center}ESC ou Q para fechar • ↑↓ para navegar • Mouse para scroll{/center}`;
    
    popup.setContent(content);

    // Adicionar botão de fechar
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
    
    // Focar no popup inicialmente
    popup.focus();
    screen.render();
  }

  /**
   * Versão alternativa para mostrar detalhes no console quando não há tela disponível
   */
  private static showReminderDetailsInConsole(reminder: Reminder): void {
    console.log('\n' + '='.repeat(60));
    console.log('📝 DETALHES DO REMINDER');
    console.log('='.repeat(60));
    
    console.log(`\n📝 Mensagem: ${reminder.message}`);
    
    const statusConfig: Record<ReminderStatus, { icon: string; name: string }> = {
      [ReminderStatus.PENDING]: { icon: '⏳', name: 'Pendente' },
      [ReminderStatus.IN_PROGRESS]: { icon: '🔄', name: 'Em Progresso' },
      [ReminderStatus.COMPLETED]: { icon: '✅', name: 'Concluído' },
      [ReminderStatus.CANCELLED]: { icon: '❌', name: 'Cancelado' }
    };

    const config = statusConfig[reminder.status];
    console.log(`\n📊 Status: ${config.icon} ${config.name}`);
    
    console.log(`\n🆔 ID: ${reminder.id}`);
    console.log(`📅 Criado em: ${reminder.createdAt.toLocaleString('pt-BR')}`);
    
    if (reminder.updatedAt.getTime() !== reminder.createdAt.getTime()) {
      console.log(`🔄 Atualizado em: ${reminder.updatedAt.toLocaleString('pt-BR')}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Cria uma visualização simplificada de texto para o chat
   */
  static createSimpleReminderBoardText(reminders: Reminder[], options: ReminderBoardOptions = {}): string {
    const remindersByStatus = this.organizeRemindersByStatus(reminders);
    const boardTitle = this.generateBoardTitle(reminders, options.title || 'Reminders');
    
    let result = `📝 **${boardTitle}**\n\n`;
    
    if (reminders.length === 0) {
      result += `📭 Nenhum reminder encontrado.\n\n💡 Use "create reminder" para criar um novo reminder.`;
      return result;
    }

    const activeGroups = remindersByStatus.filter(group => group.reminders.length > 0);

    activeGroups.forEach((statusGroup, index) => {
      result += `**${statusGroup.icon} ${statusGroup.displayName}** (${statusGroup.reminders.length})\n`;
      
      statusGroup.reminders.slice(0, 5).forEach((reminder, reminderIndex) => {
        const isLast = reminderIndex === statusGroup.reminders.length - 1 || reminderIndex === 4;
        const connector = isLast ? '└─' : '├─';
        const shortMessage = this.truncateText(reminder.message, 50);
        const shortId = reminder.id ? `#${reminder.id.slice(-6)}` : '#N/A';
        const date = this.formatReminderDate(reminder.createdAt);
        
        result += `  ${connector} ${shortMessage} (${shortId} • ${date})\n`;
      });
      
      if (statusGroup.reminders.length > 5) {
        result += `  └─ ... e mais ${statusGroup.reminders.length - 5} reminders\n`;
      }
      
      if (index < activeGroups.length - 1) {
        result += '\n';
      }
    });
    
    const totalReminders = reminders.length;
    result += `\nTotal: ${totalReminders} reminders`;
    
    return result;
  }
}
