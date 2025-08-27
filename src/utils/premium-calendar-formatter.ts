import { CalendarEvent } from '../types/calendar';
import { formatInBrazilTimezone } from './timezone';

export interface CalendarDisplayOptions {
  showDescription?: boolean;
  showLocation?: boolean;
  showSource?: boolean;
  compactMode?: boolean;
}

export class PremiumCalendarFormatter {
  // Mapeamento de emojis para horários
  private static getTimeEmoji(hour: number): string {
    const emojiMap: { [key: number]: string } = {
      0: '🕛', 1: '🕐', 2: '🕑', 3: '🕒', 4: '🕓', 5: '🕔',
      6: '🕕', 7: '🕖', 8: '🕗', 9: '🕘', 10: '🕙', 11: '🕚',
      12: '🕛', 13: '🕐', 14: '🕑', 15: '🕒', 16: '🕓', 17: '🕔',
      18: '🕕', 19: '🕖', 20: '🕗', 21: '🕘', 22: '🕙', 23: '🕚'
    };
    return emojiMap[hour] || '🕒';
  }

  // Formatar título em negrito usando formatação de terminal simples
  private static formatTitle(title: string): string {
    // Retornar o título original sem conversão Unicode problemática
    return title;
  }

  // Obter nome do provedor formatado
  private static getProviderDisplay(source: string): string {
    const providerMap: { [key: string]: string } = {
      'google': 'Google Calendar',
      'microsoft': 'Microsoft Calendar',
      'outlook': 'Outlook Calendar'
    };
    return providerMap[source.toLowerCase()] || source;
  }

  // Formatar data por extenso
  private static formatDateHeader(date: Date): string {
    const weekdays = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${weekday}, ${day} de ${month} de ${year}`;
  }

  // Formatar horário de evento
  private static formatEventTime(startTime: Date, endTime: Date, isAllDay: boolean): string {
    if (isAllDay) {
      return '⭐ Dia inteiro';
    }
    
    const start = formatInBrazilTimezone(startTime, 'HH:mm');
    const end = formatInBrazilTimezone(endTime, 'HH:mm');
    const startHour = parseInt(formatInBrazilTimezone(startTime, 'H'));
    const emoji = this.getTimeEmoji(startHour);
    
    return `${emoji} ${start}–${end}`;
  }

  // Criar header da agenda
  private static createAgendaHeader(date: Date): string {
    const dateText = this.formatDateHeader(date);
    const title = '📅 Agenda';
    const totalWidth = Math.max(55, dateText.length + 6);
    const padding = Math.floor((totalWidth - title.length) / 2);
    const headerTitle = '━'.repeat(padding) + ` ${title} ` + '━'.repeat(totalWidth - padding - title.length - 2);
    
    return [
      `┏${headerTitle}┓`,
      `┃ ${dateText.padEnd(totalWidth - 2)} ┃`,
      `┗${'━'.repeat(totalWidth)}┛`
    ].join('\n');
  }

  // Formatar evento individual
  private static formatSingleEvent(
    event: CalendarEvent, 
    options: CalendarDisplayOptions
  ): string[] {
    const lines: string[] = [];
    
    const timeStr = this.formatEventTime(
      new Date(event.startTime), 
      new Date(event.endTime), 
      event.isAllDay || false
    );
    const titleStr = this.formatTitle(event.title);
    const sourceStr = options.showSource !== false ? 
      `[${this.getProviderDisplay(event.source)}]` : '';
    
    // Linha principal do evento
    lines.push(`┃  ${timeStr}  ${titleStr}   ${sourceStr}`);
    
    // Localização (se disponível)
    if (event.location && options.showLocation !== false) {
      lines.push(`┃     📍 ${event.location}`);
    }
    
    // Descrição (se disponível)
    if (event.description && options.showDescription !== false) {
      // Limitar descrição a uma linha para manter elegância
      const desc = event.description.length > 50 ? 
        event.description.substring(0, 47) + '...' : 
        event.description;
      lines.push(`┃     📝 ${desc}`);
    }
    
    return lines;
  }

  // Formatar múltiplos eventos do dia
  public static formatDayEvents(
    events: CalendarEvent[], 
    date?: Date,
    options: CalendarDisplayOptions = {}
  ): string {
    if (events.length === 0) {
      const today = date || new Date();
      const header = this.createAgendaHeader(today);
      return [
        header,
        '┃',
        '┃  📭 Nenhum evento programado para hoje',
        '┃',
        '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
        '',
        '─ Seu dia está livre! Que tal programar alguma atividade produtiva?'
      ].join('\n');
    }

    // Agrupar eventos por data
    const eventsByDate = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const eventDate = formatInBrazilTimezone(new Date(event.startTime), 'yyyy-MM-dd');
      if (!eventsByDate.has(eventDate)) {
        eventsByDate.set(eventDate, []);
      }
      eventsByDate.get(eventDate)!.push(event);
    });

    const result: string[] = [];
    let totalDuration = 0;
    let totalEvents = 0;

    // Processar cada dia
    for (const [dateStr, dayEvents] of eventsByDate) {
      const eventDate = new Date(dateStr + 'T12:00:00');
      const header = this.createAgendaHeader(eventDate);
      result.push(header);
      result.push('┃');

      // Ordenar eventos por horário
      const sortedEvents = dayEvents.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      sortedEvents.forEach((event, index) => {
        const eventLines = this.formatSingleEvent(event, options);
        result.push(...eventLines);
        
        // Adicionar linha em branco entre eventos (exceto no último)
        if (index < sortedEvents.length - 1) {
          result.push('┃');
        }

        // Calcular duração
        const duration = (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60);
        totalDuration += duration;
        totalEvents++;
      });

      result.push('┃');
      result.push('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
    }

    // Resumo
    result.push('');
    const durationText = totalDuration < 1 ? 
      `${Math.round(totalDuration * 60)}min` : 
      `${totalDuration.toFixed(1)}h`;
      
    const eventWord = totalEvents === 1 ? 'reunião' : 'reuniões';
    result.push(`─ Resumo: ${totalEvents} ${eventWord} • ${durationText} no total`);
    result.push('  Ação: quer que eu verifique conflitos ou procure janelas livres?');

    return result.join('\n');
  }

  // Formatar eventos da semana
  public static formatWeekEvents(
    events: CalendarEvent[],
    options: CalendarDisplayOptions = {}
  ): string {
    if (events.length === 0) {
      return [
        '┏━━━━━━━━━━━━━━━━━━━━━━ 📅 Agenda Semanal ━━━━━━━━━━━━━━━━━━━━━━┓',
        '┃                                                             ┃',
        '┃  📭 Nenhum evento programado para esta semana               ┃',
        '┃                                                             ┃',
        '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
        '',
        '─ Semana livre! Perfeito para focar em projetos importantes.'
      ].join('\n');
    }

    return this.formatDayEvents(events, undefined, options);
  }

  // Formatar resumo rápido de eventos
  public static formatEventsSummary(events: CalendarEvent[]): string {
    if (events.length === 0) {
      return '📅 Nenhum evento hoje • Dia livre para produtividade!';
    }

    const totalDuration = events.reduce((acc, event) => {
      return acc + (new Date(event.endTime).getTime() - new Date(event.startTime).getTime());
    }, 0) / (1000 * 60 * 60);

    const durationText = totalDuration < 1 ? 
      `${Math.round(totalDuration * 60)}min` : 
      `${totalDuration.toFixed(1)}h`;

    const eventWord = events.length === 1 ? 'evento' : 'eventos';
    return `📅 ${events.length} ${eventWord} hoje • ${durationText} no total`;
  }

  // Formatar próximo evento
  public static formatNextEvent(event: CalendarEvent | null): string {
    if (!event) {
      return '📅 Próximo: Nenhum evento programado • Tempo livre!';
    }

    const startTime = formatInBrazilTimezone(new Date(event.startTime), 'HH:mm');
    const title = this.formatTitle(event.title);
    const source = this.getProviderDisplay(event.source);
    
    return `📅 Próximo: ${startTime} • ${title} [${source}]`;
  }
}
