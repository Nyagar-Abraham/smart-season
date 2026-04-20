import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const fieldSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cropType: z.string().min(1, 'Crop type is required'),
  plantingDate: z.string().or(z.date()).transform((val) => new Date(val)),
  currentStage: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']).optional(),
  assignedAgentId: z.number().int().optional().nullable().or(z.string().transform(val => val === 'null' ? null : parseInt(val))).optional(),
  images: z.array(z.string()).optional(),
});

const fieldUpdateSchema = z.object({
  stageUpdate: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']).optional(),
  notes: z.string().optional(),
});

const assignFieldSchema = z.object({
  agentId: z.number().int().nullable(),
});

export const validateField = (req: Request, res: Response, next: NextFunction) => {
  try {
    fieldSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors[0].message });
  }
};

export const validateFieldUpdate = (req: Request, res: Response, next: NextFunction) => {
  try {
    fieldUpdateSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors[0].message });
  }
};

export const validateAssignField = (req: Request, res: Response, next: NextFunction) => {
  try {
    assignFieldSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors[0].message });
  }
};
