import fs from 'fs';
import path from 'path';

export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  WARN = 'WARN'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logFilePath: string;
  private enableFile: boolean;

  private constructor() {
    this.logFilePath = path.join(process.cwd(), 'logs', 'claudia.log');
    this.enableFile = process.env.LOG_FILE == 'true';
    
    // Cria o diretório de logs se não existir
    this.ensureLogDirectoryExists();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private ensureLogDirectoryExists(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, component, message, data, error } = entry;
    let logLine = `[${timestamp}] [${level}] [${component}] ${message}`;
    
    if (data) {
      logLine += ` | Data: ${JSON.stringify(data)}`;
    }
    
    if (error) {
      logLine += ` | Error: ${error.message}`;
      if (error.stack) {
        logLine += ` | Stack: ${error.stack}`;
      }
    }
    
    return logLine;
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.enableFile) return;

    const logLine = this.formatLogEntry(entry) + '\n';
    
    try {
      fs.appendFileSync(this.logFilePath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private log(level: LogLevel, component: string, message: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      component,
      message,
      data,
      error
    };

    this.writeToFile(entry);
  }

  public logInfo(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  public logError(component: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data, error);
  }

  public logDebug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  public logWarn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  public clearLogs(): void {
    try {
      if (fs.existsSync(this.logFilePath)) {
        fs.unlinkSync(this.logFilePath);
      }
    } catch (error) {
      console.error('Failed to clear log file:', error);
    }
  }
}

// Instância global e funções helper para uso mais fácil
export const logger = Logger.getInstance();

export function logInfo(component: string, message: string, data?: any): void {
  logger.logInfo(component, message, data);
}

export function logError(component: string, message: string, error?: Error, data?: any): void {
  logger.logError(component, message, error, data);
}

export function logDebug(component: string, message: string, data?: any): void {
  logger.logDebug(component, message, data);
}

export function logWarn(component: string, message: string, data?: any): void {
  logger.logWarn(component, message, data);
}
