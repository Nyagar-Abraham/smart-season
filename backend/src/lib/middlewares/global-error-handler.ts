import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.js';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error({
    err,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  }, 'Unhandled Error');

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
  });
};
