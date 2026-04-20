import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { arcjetMiddleware } from './lib/middlewares/arcjet-middleware.js';
import { globalErrorHandler } from './lib/middlewares/global-error-handler.js';
import AuthRoute from './modules/auth/auth-route.js';
import FieldRoute from './modules/fields/field-route.js';
import AdminRoute from './modules/admin/admin-route.js';

dotenv.config();

const app: Application = express();

const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || '/api/v1';
const COOKIE_PARSER_SECRET = process.env.COOKIE_PARSER_SECRET;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:5173',
  credentials: true,
}));

// Request logging
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(morgan('combined', { stream: accessLogStream }));

app.use(pinoHttp({
  logger,
  autoLogging: true,
  genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
}));

app.use(express.json());
app.use(cookieParser(COOKIE_PARSER_SECRET));

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.get('/', (req: Request, res: Response) => {
  res.send('Smart Season Field Monitoring Service');
});

app.use(arcjetMiddleware);

app.use(API_BASE_URL + '/auth', AuthRoute);
app.use(API_BASE_URL + '/fields', FieldRoute);
app.use(API_BASE_URL + '/admin', AdminRoute);

app.all('/{*path}', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
