import type { Request, Response, NextFunction } from 'express';
import { fieldService } from './field-service.js';
import { processImageBuffer } from '../../lib/utils/image-utils.js';
import { uploadToS3 } from '../media/service.js';

async function processAndUploadImages(files: Express.Multer.File[]) {
  const uploadPromises = files.map(async (file) => {
    const processedBuffer = await processImageBuffer(file.buffer);
    const { publicUrl } = await uploadToS3(
      processedBuffer,
      `${Date.now()}-${file.originalname.split('.')[0]}.webp`,
      'image/webp',
      'fields'
    );
    return publicUrl;
  });
  return Promise.all(uploadPromises);
}

export const handleCreateField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const imageUrls = req.files ? await processAndUploadImages(req.files as Express.Multer.File[]) : [];
    const fieldData = { ...req.body, images: imageUrls };
    const field = await fieldService.createField(fieldData);
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
};

export const handleGetAllFields = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fields = await fieldService.getAllFields();
    res.status(200).json({ success: true, data: fields });
  } catch (error) {
    next(error);
  }
};

export const handleGetFieldById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const field = await fieldService.getFieldById(id);
    res.status(200).json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    console.log("Files: ", req.files);
    const newImageUrls = req.files ? await processAndUploadImages(req.files as Express.Multer.File[]) : [];
    
    const existingImages = Array.isArray(req.body.images) ? req.body.images : [];
    const fieldData = { ...req.body, images: [...existingImages, ...newImageUrls] };
    
    const field = await fieldService.updateField(id, fieldData);
    res.status(200).json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
};

export const handleAssignField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { agentId } = req.body;
    const field = await fieldService.assignField(id, agentId);
    res.status(200).json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
};

export const handleCreateFieldUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fieldId = parseInt(req.params.id as string);
    const agentId = (req as any).user.id;
    const update = await fieldService.addFieldUpdate(fieldId, agentId, req.body);
    res.status(201).json({ success: true, data: update });
  } catch (error) {
    next(error);
  }
};

export const handleGetFieldUpdates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fieldId = parseInt(req.params.id as string);
    const updates = await fieldService.getFieldUpdates(fieldId);
    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyFields = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentId = (req as any).user.id;
    const fields = await fieldService.getFieldsByAgent(agentId);
    res.status(200).json({ success: true, data: fields });
  } catch (error) {
    next(error);
  }
};

export const handleGetAgentUpdates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentId = (req as any).user.id;
    const updates = await fieldService.getUpdatesByAgent(agentId);
    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    next(error);
  }
};

export const handleRefreshFieldStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    await fieldService.refreshFieldStatus(id);
    const updatedField = await fieldService.getFieldById(id);
    res.status(200).json({ success: true, data: updatedField });
  } catch (error) {
    next(error);
  }
};
