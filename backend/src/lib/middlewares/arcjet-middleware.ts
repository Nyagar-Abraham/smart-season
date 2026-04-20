import type { ArcjetDecision } from '@arcjet/node';
import { aj } from '../../config/arcjet-config.ts';
import type { Request, Response, NextFunction } from 'express';

export const arcjetMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let decision: ArcjetDecision;
  try {
    decision = await aj.protect(req);
  } catch (error) {
    console.error('Arcjet error:', error);
    return res.status(503).json({
      success: false,
      message: 'Request protection service unavailable',
    });
  }

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Forbidden by security policy',
    });
  }

  return next();
};
