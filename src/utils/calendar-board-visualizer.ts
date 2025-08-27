import * as blessed from 'blessed';
import { CalendarEvent } from '../types/calendar';
import { formatInBrazilTimezone } from './timezone';

export interface CalendarBoardOptions {
  width?: number;
  height?: number;
  title?: string;
  showDescription?: boolean;
  maxEventsPerDay?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface EventsByDay {
  date: string;
  displayDate: string;
  events: CalendarEvent[];
}

export class CalendarBoardVisualizer {
  /**
   * Cria uma visualização de board de calendário no terminal usando blessed
   */
  static createCalendarBoardVisualization(
    events: CalendarEvent[], 
    options: CalendarBoardOptions = {}
  ): any {
    const {
      width = 120,
      height = 30,
      title = 'Reuniões',
      showDescription = true,
      maxEventsPerDay = 8,
      startDate,
      endDate
    } = options;

    // Organizar eventos por dia
    const eventsByDay = this.organizeEventsByDay(events, startDate, endDate);

    // Determinar título dinâmico baseado no período
    const boardTitle = this.generateBoardTitle(eventsByDay, title);

    // Container principal do board de calendário
    const boardContainer = blessed.box({
      width,
      height,
      border: {
        type: 'line',
        fg: 6 // cyan
      },
      label: ` 📅 ${boardTitle} `,
      scrollable: true,
      mouse: true,
      keys: true,
      vi: true
    });

    // Se não há eventos
    if (eventsByDay.length === 0) {
      const emptyMessage = blessed.box({
        parent: boardContainer,
        top: 'center',
        left: 'center',
        width: 40,
        height: 5,
        content: '{center}📭 Nenhuma reunião encontrada\n\nSelecione outro período{/center}',
        tags: true,
        style: {
          fg: 'gray'
        }
      });
      return boardContainer;
    }

    // Calcular largura de cada coluna
    const columnWidth = Math.floor((width - 4 - (eventsByDay.length - 1)) / eventsByDay.length);
    
    // Criar colunas para cada dia
    eventsByDay.forEach((dayData, index) => {
      const left = 1 + (index * (columnWidth + 1));
      
      // Container do dia
      const dayContainer = blessed.box({
        parent: boardContainer,
        top: 1,
        left,
        width: columnWidth,
        height: height - 4,
        border: {
          type: 'line',
          fg: 3 // yellow
        },
        label: ` ${dayData.displayDate} (${dayData.events.length}) `,
        scrollable: true
      });

      // Adicionar eventos no dia
      let eventTop = 1;
      const displayEvents = dayData.events.slice(0, maxEventsPerDay);
      
      displayEvents.forEach((event, eventIndex) => {
        const eventHeight = this.calculateEventHeight(event, showDescription, columnWidth);
        
        const eventElement = this.createEventElement({
          event,
          parent: dayContainer,
          top: eventTop,
          width: columnWidth - 2,
          height: eventHeight,
          showDescription,
          index: eventIndex
        });

        eventTop += eventHeight + 1;
      });

      // Mostrar indicador se há mais eventos
      if (dayData.events.length > maxEventsPerDay) {
        blessed.box({
          parent: dayContainer,
          top: eventTop,
          left: 1,
          width: columnWidth - 4,
          height: 1,
          content: `{center}{dim}... e mais ${dayData.events.length - maxEventsPerDay} reuniões{/center}`,
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
   * Cria um elemento de evento individual (card)
   */
  private static createEventElement(options: {
    event: CalendarEvent;
    parent: any;
    top: number;
    width: number;
    height: number;
    showDescription: boolean;
    index: number;
  }): any {
    const { event, parent, top, width, height, showDescription, index } = options;
    
    // Cores alternadas para os cards (usando números para blessed)
    const cardColors = [7, 2, 4, 5, 6]; // white, green, blue, magenta, cyan
    const borderColor = cardColors[index % cardColors.length];
    
    const eventElement = blessed.box({
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
    let content = `{bold}${this.truncateText(event.title, width - 4)}{/bold}`;
    
    // Mostrar horário
    const timeStr = this.formatEventTime(event);
    content += `\n{cyan-fg}${timeStr}{/cyan-fg}`;
    
    // Mostrar origem (Google/Microsoft)
    const sourceIcon = event.source === 'google' ? '🟦' : '🟨';
    const sourceName = event.source === 'google' ? 'Google' : 'Microsoft';
    content += `\n{dim}${sourceIcon} ${sourceName}{/dim}`;
    
    if (showDescription && event.description) {
      const truncatedDesc = this.truncateText(event.description, width - 4);
      content += `\n{green-fg}${truncatedDesc}{/green-fg}`;
    }
    
    if (event.location) {
      content += `\n{yellow-fg}📍 ${this.truncateText(event.location, width - 6)}{/yellow-fg}`;
    }

    eventElement.setContent(content);

    // Click para mostrar detalhes
    eventElement.on('click', () => {
      this.showEventDetails(event);
    });

    return eventElement;
  }

  /**
   * Organiza eventos por dia
   */
  private static organizeEventsByDay(
    events: CalendarEvent[], 
    startDate?: Date, 
    endDate?: Date
  ): EventsByDay[] {
    const eventsByDay: Map<string, CalendarEvent[]> = new Map();
    
    // Filtrar eventos por período se especificado
    let filteredEvents = events;
    if (startDate && endDate) {
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    // Agrupar por dia
    filteredEvents.forEach(event => {
      const dateKey = formatInBrazilTimezone(new Date(event.startTime), 'yyyy-MM-dd');
      
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, []);
      }
      
      eventsByDay.get(dateKey)!.push(event);
    });
    
    // Converter para array ordenado
    const result: EventsByDay[] = [];
    const sortedDates = Array.from(eventsByDay.keys()).sort();
    
    sortedDates.forEach(dateKey => {
      const events = eventsByDay.get(dateKey)!;
      // Ordenar eventos do dia por horário
      events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      const displayDate = this.formatDisplayDate(dateKey);
      
      result.push({
        date: dateKey,
        displayDate,
        events
      });
    });
    
    return result;
  }

  /**
   * Gera título dinâmico do board baseado no período
   */
  private static generateBoardTitle(eventsByDay: EventsByDay[], baseTitle: string): string {
    if (eventsByDay.length === 0) {
      return `${baseTitle} - Nenhuma encontrada`;
    }
    
    if (eventsByDay.length === 1) {
      return `${baseTitle} - ${eventsByDay[0].displayDate}`;
    }
    
    const firstDate = eventsByDay[0].displayDate;
    const lastDate = eventsByDay[eventsByDay.length - 1].displayDate;
    
    if (eventsByDay.length === 7) {
      return `${baseTitle} da Semana (${firstDate} a ${lastDate})`;
    }
    
    return `${baseTitle} (${firstDate} a ${lastDate})`;
  }

  /**
   * Formatar data para exibição
   */
  private static formatDisplayDate(dateKey: string): string {
    const date = new Date(dateKey + 'T12:00:00'); // Adicionar hora para evitar problemas de timezone
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Verificar se é hoje ou amanhã
    if (formatInBrazilTimezone(today, 'yyyy-MM-dd') === dateKey) {
      return 'Hoje';
    }
    
    if (formatInBrazilTimezone(tomorrow, 'yyyy-MM-dd') === dateKey) {
      return 'Amanhã';
    }
    
    // Formato normal: "Seg 27"
    const weekday = formatInBrazilTimezone(date, 'EEE');
    const day = formatInBrazilTimezone(date, 'd');
    
    return `${weekday} ${day}`;
  }

  /**
   * Formatar horário do evento
   */
  private static formatEventTime(event: CalendarEvent): string {
    if (event.isAllDay) {
      return '⭐ Dia inteiro';
    }
    
    const start = formatInBrazilTimezone(new Date(event.startTime), 'HH:mm');
    const end = formatInBrazilTimezone(new Date(event.endTime), 'HH:mm');
    
    return `${start}–${end}`;
  }

  /**
   * Calcula altura necessária para um evento
   */
  private static calculateEventHeight(
    event: CalendarEvent, 
    showDescription: boolean, 
    width: number
  ): number {
    let lines = 1; // Título
    lines += 1; // Horário
    lines += 1; // Origem (Google/Microsoft)
    
    if (showDescription && event.description) lines += 1;
    if (event.location) lines += 1;
    
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
   * Mostra detalhes completos do evento em uma popup modal
   */
  private static showEventDetails(event: CalendarEvent): void {
    // Obter a tela principal (screen)
    const screen = (global as any).claudiaScreen;
    if (!screen) {
      this.showEventDetailsInConsole(event);
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
      label: ' 📅 Detalhes da Reunião ',
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

    // Formatar conteúdo do evento
    let content = `{bold}{cyan-fg}📝 Título:{/cyan-fg}{/bold}\n${event.title || 'Sem título'}\n\n`;
    
    // Horário
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const formattedStart = startTime.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' às ' + formatInBrazilTimezone(startTime, 'HH:mm');
    const formattedEnd = formatInBrazilTimezone(endTime, 'HH:mm');
    
    if (event.isAllDay) {
      content += `{bold}{cyan-fg}⏰ Horário:{/cyan-fg}{/bold}\n⭐ Evento de dia inteiro\n${formattedStart.split(' às')[0]}\n\n`;
    } else {
      content += `{bold}{cyan-fg}⏰ Horário:{/cyan-fg}{/bold}\n${formattedStart} até ${formattedEnd}\n\n`;
    }
    
    // Origem
    const sourceIcon = event.source === 'google' ? '🟦' : '🟨';
    const sourceName = event.source === 'google' ? 'Google Calendar' : 'Microsoft Calendar';
    content += `{bold}{cyan-fg}🌐 Origem:{/cyan-fg}{/bold}\n${sourceIcon} ${sourceName}\n\n`;
    
    if (event.description) {
      content += `{bold}{cyan-fg}📄 Descrição:{/cyan-fg}{/bold}\n${event.description}\n\n`;
    }
    
    if (event.location) {
      content += `{bold}{cyan-fg}📍 Local:{/cyan-fg}{/bold}\n${event.location}\n\n`;
    }
    
    if (event.attendees && event.attendees.length > 0) {
      content += `{bold}{cyan-fg}👥 Participantes (${event.attendees.length}):{/cyan-fg}{/bold}\n`;
      event.attendees.forEach(attendee => {
        content += `  • ${attendee}\n`;
      });
      content += '\n';
    }
    
    content += `{bold}{yellow-fg}🆔 ID:{/yellow-fg}{/bold} {dim}${event.id}{/dim}\n`;
    content += `{bold}{yellow-fg}📋 Calendário:{/yellow-fg}{/bold} {dim}${event.calendarId}{/dim}\n\n`;
    
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
  private static showEventDetailsInConsole(event: CalendarEvent): void {
    console.log('\n' + '='.repeat(60));
    console.log('📅 DETALHES DA REUNIÃO');
    console.log('='.repeat(60));
    
    console.log(`\n📝 Título: ${event.title || 'Sem título'}`);
    
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    
    if (event.isAllDay) {
      console.log(`\n⏰ Horário: ⭐ Evento de dia inteiro`);
      console.log(`📅 Data: ${startTime.toLocaleDateString('pt-BR')}`);
    } else {
      console.log(`\n⏰ Horário: ${formatInBrazilTimezone(startTime, 'HH:mm')} até ${formatInBrazilTimezone(endTime, 'HH:mm')}`);
      console.log(`📅 Data: ${startTime.toLocaleDateString('pt-BR')}`);
    }
    
    const sourceIcon = event.source === 'google' ? '🟦' : '🟨';
    const sourceName = event.source === 'google' ? 'Google Calendar' : 'Microsoft Calendar';
    console.log(`\n🌐 Origem: ${sourceIcon} ${sourceName}`);
    
    if (event.description) {
      console.log(`\n📄 Descrição: ${event.description}`);
    }
    
    if (event.location) {
      console.log(`\n📍 Local: ${event.location}`);
    }
    
    if (event.attendees && event.attendees.length > 0) {
      console.log(`\n👥 Participantes (${event.attendees.length}):`);
      event.attendees.forEach(attendee => {
        console.log(`  • ${attendee}`);
      });
    }
    
    console.log(`\n🆔 ID: ${event.id}`);
    console.log(`📋 Calendário: ${event.calendarId}`);
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Cria uma visualização simplificada de texto para o chat
   */
  static createSimpleCalendarBoardText(events: CalendarEvent[], options: CalendarBoardOptions = {}): string {
    const eventsByDay = this.organizeEventsByDay(events, options.startDate, options.endDate);
    const boardTitle = this.generateBoardTitle(eventsByDay, options.title || 'Reuniões');
    
    let result = `📅 **${boardTitle}**\n\n`;
    
    if (eventsByDay.length === 0) {
      result += `📭 Nenhuma reunião encontrada no período especificado.\n`;
      return result;
    }
    
    eventsByDay.forEach(dayData => {
      result += `**${dayData.displayDate}** (${dayData.events.length} reuniões)\n`;
      
      if (dayData.events.length === 0) {
        result += `  {dim}└─ Dia livre{/dim}\n`;
      } else {
        dayData.events.slice(0, 5).forEach((event, index) => {
          const isLast = index === dayData.events.length - 1 || index === 4;
          const connector = isLast ? '└─' : '├─';
          const timeStr = this.formatEventTime(event);
          const sourceIcon = event.source === 'google' ? '🟦' : '🟨';
          
          result += `  {green-fg}${connector}{/green-fg} ${timeStr} ${event.title} ${sourceIcon}\n`;
        });
        
        if (dayData.events.length > 5) {
          result += `  {dim}└─ ... e mais ${dayData.events.length - 5} reuniões{/dim}\n`;
        }
      }
      result += '\n';
    });
    
    const totalEvents = eventsByDay.reduce((sum, day) => sum + day.events.length, 0);
    result += `{bold}Total: ${totalEvents} reuniões{/bold}`;
    
    return result;
  }
}
