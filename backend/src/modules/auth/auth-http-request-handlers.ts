import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth-service.js';

export const handleSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};
