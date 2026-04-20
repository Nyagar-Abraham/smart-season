import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt-service.js';
import { type Role } from '../../database/schemas/users.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }

  req.user = decoded;
  next();
};

export const authorize = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action',
      });
    }
    next();
  };
};
