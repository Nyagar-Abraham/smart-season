import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const targets: any[] = [
  // File outputs for structured logs
  {
    target: 'pino/file',
    level: 'info',
    options: {
      destination: path.join(logsDir, 'app.log'),
      mkdir: true,
    },
  },
  {
    target: 'pino/file',
    level: 'error',
    options: {
      destination: path.join(logsDir, 'error.log'),
      mkdir: true,
    },
  },
];

// Pretty console output only in development
if (process.env.NODE_ENV !== 'production') {
  targets.unshift({
    target: 'pino-pretty',
    level: 'debug',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  });
}

const transport = pino.transport({ targets });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      env: process.env.NODE_ENV,
    },
  },
  transport
);

export default logger;
