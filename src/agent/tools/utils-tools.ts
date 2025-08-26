import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getBrazilDateTimeToolSchema } from "./utils-schemas";
import { logInfo, logError } from "../../utils/logger";

/**
 * Obtém a data e hora atual no fuso horário de São Paulo/Brasil
 */
function getBrazilDateTime(format: string = 'default'): string {
  try {
    // Criar data atual no fuso horário do Brasil (UTC-3)
    const now = new Date();
    
    // Ajustar para o fuso horário de São Paulo (UTC-3)
    // Nota: Isso é uma simplificação. Para uma implementação mais robusta,
    // seria ideal usar uma biblioteca como date-fns-tz ou moment-timezone
    const brazilOffset = -3; // UTC-3 para São Paulo
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const brazilTime = new Date(utc + (brazilOffset * 3600000));
    
    switch (format) {
      case 'iso':
        return brazilTime.toISOString().replace('Z', '-03:00');
      
      case 'timestamp':
        return Math.floor(brazilTime.getTime() / 1000).toString();
      
      case 'full':
        const diasSemana = [
          'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
          'Quinta-feira', 'Sexta-feira', 'Sábado'
        ];
        const meses = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        
        const diaSemana = diasSemana[brazilTime.getDay()];
        const dia = brazilTime.getDate();
        const mes = meses[brazilTime.getMonth()];
        const ano = brazilTime.getFullYear();
        const hora = brazilTime.toLocaleTimeString('pt-BR', { hour12: false });
        
        return `${diaSemana}, ${dia} de ${mes} de ${ano} às ${hora} (BRT)`;
      
      case 'default':
      default:
        // Formato brasileiro: DD/MM/AAAA HH:MM:SS
        const dia_pad = String(brazilTime.getDate()).padStart(2, '0');
        const mes_pad = String(brazilTime.getMonth() + 1).padStart(2, '0');
        const ano_str = brazilTime.getFullYear();
        const hora_pad = String(brazilTime.getHours()).padStart(2, '0');
        const min_pad = String(brazilTime.getMinutes()).padStart(2, '0');
        const seg_pad = String(brazilTime.getSeconds()).padStart(2, '0');
        
        return `${dia_pad}/${mes_pad}/${ano_str} ${hora_pad}:${min_pad}:${seg_pad}`;
    }
  } catch (error) {
    throw new Error(`Erro ao obter data/hora: ${error}`);
  }
}

export const getBrazilDateTimeTool = tool(
  async (input) => {
    const { format = 'default' } = input as z.infer<typeof getBrazilDateTimeToolSchema>;
    
    logInfo('UtilsTool', 'Getting Brazil date/time via tool', { 
      format
    });
    
    try {
      const result = getBrazilDateTime(format);
      
      logInfo('UtilsTool', 'Brazil date/time retrieved successfully via tool', { 
        format,
        result
      });
      
      return {
        dateTime: result,
        timezone: 'America/Sao_Paulo',
        format,
        message: 'Data e hora atual do Brasil (São Paulo)'
      };
    } catch (error) {
      logError('UtilsTool', 'Error getting Brazil date/time via tool', error as Error, { format });
      throw error;
    }
  },
  {
    name: "get_brazil_datetime",
    description: "Obtém a data e horário atual do Brasil (fuso horário de São Paulo) em diferentes formatos",
    schema: getBrazilDateTimeToolSchema
  }
);

export const utilsTools = [
  getBrazilDateTimeTool
];
