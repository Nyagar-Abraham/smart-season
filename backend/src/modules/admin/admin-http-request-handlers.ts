import type { Request, Response, NextFunction } from 'express';
import { adminService } from './admin-service.js';

export const handleGetAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await adminService.getAllAgents();
    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error: any) {
    next(error);
  }
};
