import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { logInfo, logWarn } from './logger';

/**
 * Timezone brasileiro padrão
 */
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte uma data/string para o timezone brasileiro correto
 * @param dateInput Data como string ISO, Date object ou timestamp
 * @returns Data no timezone brasileiro
 */
export function toBrazilTimezone(dateInput: string | Date | number): Date {
  try {
    let sourceDate: Date;
    
    if (typeof dateInput === 'string') {
      // Se é string ISO, parse primeiro
      sourceDate = parseISO(dateInput);
    } else if (typeof dateInput === 'number') {
      // Se é timestamp
      sourceDate = new Date(dateInput);
    } else {
      // Se já é Date object
      sourceDate = dateInput;
    }

    // Verificar se já estamos no timezone brasileiro
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (currentTimezone === BRAZIL_TIMEZONE) {
      // Se já estamos no timezone correto, retornar como está
      return sourceDate;
    }

    // Converter para o timezone brasileiro apenas se necessário
    const brazilTime = toZonedTime(sourceDate, BRAZIL_TIMEZONE);
    
    logInfo('TimezoneUtils', 'Date converted to Brazil timezone', {
      input: dateInput.toString(),
      sourceUTC: sourceDate.toISOString(),
      brazilTime: brazilTime.toISOString(),
      currentTimezone,
      targetTimezone: BRAZIL_TIMEZONE
    });

    return brazilTime;
  } catch (error) {
    logWarn('TimezoneUtils', 'Error converting date to Brazil timezone', { 
      dateInput: dateInput?.toString(),
      error: (error as Error).message 
    });
    return new Date();
  }
}

/**
 * Formata uma data no timezone brasileiro
 * @param date Data a ser formatada
 * @param formatString Formato desejado (padrão: 'dd/MM/yyyy HH:mm')
 * @returns String formatada
 */
export function formatInBrazilTimezone(
  date: string | Date,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string {
  try {
    const sourceDate = typeof date === 'string' ? parseISO(date) : date;
    return format(sourceDate, formatString, { timeZone: BRAZIL_TIMEZONE });
  } catch (error) {
    logWarn('TimezoneUtils', 'Error formatting date', { 
      date: date?.toString(),
      error: (error as Error).message 
    });
    return 'Data inválida';
  }
}

/**
 * Formata apenas o horário no timezone brasileiro
 * @param date Data a ser formatada
 * @returns String com horário (HH:mm)
 */
export function formatTimeInBrazilTimezone(date: string | Date): string {
  return formatInBrazilTimezone(date, 'HH:mm');
}

/**
 * Formata apenas a data no timezone brasileiro
 * @param date Data a ser formatada
 * @returns String com data (dd/MM/yyyy)
 */
export function formatDateInBrazilTimezone(date: string | Date): string {
  return formatInBrazilTimezone(date, 'dd/MM/yyyy');
}

/**
 * Cria o início do dia no timezone brasileiro
 * @param date Data base
 * @returns Date representando 00:00:00 do dia no timezone brasileiro
 */
export function startOfDayBrazil(date: string | Date): Date {
  const sourceDate = typeof date === 'string' ? parseISO(date) : date;
  
  // Se já estamos no timezone brasileiro, usar diretamente
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let referenceDate: Date;
  
  if (currentTimezone === BRAZIL_TIMEZONE) {
    referenceDate = sourceDate;
  } else {
    referenceDate = toZonedTime(sourceDate, BRAZIL_TIMEZONE);
  }
  
  // Criar nova data com horário 00:00:00 no timezone brasileiro
  const startOfDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0, 0, 0, 0
  );
  
  return startOfDay;
}

/**
 * Cria o fim do dia no timezone brasileiro
 * @param date Data base
 * @returns Date representando 23:59:59.999 do dia no timezone brasileiro
 */
export function endOfDayBrazil(date: string | Date): Date {
  const sourceDate = typeof date === 'string' ? parseISO(date) : date;
  
  // Se já estamos no timezone brasileiro, usar diretamente
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let referenceDate: Date;
  
  if (currentTimezone === BRAZIL_TIMEZONE) {
    referenceDate = sourceDate;
  } else {
    referenceDate = toZonedTime(sourceDate, BRAZIL_TIMEZONE);
  }
  
  // Criar nova data com horário 23:59:59.999 no timezone brasileiro
  const endOfDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    23, 59, 59, 999
  );
  
  return endOfDay;
}

/**
 * Verifica se uma data está no timezone correto (Brasil)
 * @param date Data para verificar
 * @returns true se a data parece estar no timezone correto
 */
export function isDateInBrazilTimezone(date: Date): boolean {
  const now = new Date();
  const localOffset = now.getTimezoneOffset();
  // Brasil normalmente tem offset de -180 (UTC-3) ou -120 (UTC-2 durante horário de verão)
  return localOffset >= -240 && localOffset <= -120;
}

/**
 * Corrige especificamente o problema do Microsoft Teams/Outlook
 * que retorna datas com offset incorreto
 * @param teamsDateString String de data vinda do Teams/Outlook
 * @returns Data corrigida para o timezone brasileiro
 */
export function fixTeamsTimezone(teamsDateString: string): Date {
  try {
    // Parse a data original como UTC
    const originalDate = parseISO(teamsDateString);
    
    // Microsoft Graph retorna datas em UTC.
    // O problema é que quando o usuário está no timezone brasileiro,
    // a data já é automaticamente convertida pelo JavaScript.
    // Simplesmente retornar a data original deve funcionar.
    
    logInfo('TimezoneUtils', 'Teams date processed', {
      original: teamsDateString,
      originalParsed: originalDate.toISOString(),
      result: originalDate.toISOString(),
      timezone: BRAZIL_TIMEZONE,
      method: 'no_conversion'
    });
    
    return originalDate;
  } catch (error) {
    logWarn('TimezoneUtils', 'Error fixing Teams timezone', {
      input: teamsDateString,
      error: (error as Error).message
    });
    return new Date();
  }
}
