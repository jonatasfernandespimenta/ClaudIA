import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve(__dirname, '..', '..', 'logs', 'claudia.log.txt');

function ensureLogFile(): void {
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
  }
}

function writeLog(level: string, message: string): void {
  ensureLogFile();
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFilePath, `[${timestamp}] [${level}] ${message}\n`);
}

export function logInfo(message: string): void {
  writeLog('INFO', message);
}

export function logError(message: string): void {
  writeLog('ERROR', message);
}
