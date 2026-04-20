import { fieldRepository, fieldUpdateRepository } from '../../repositories/field-repository.js';
import { type NewField, type Field } from '../../database/schemas/fields.js';
import { type NewFieldUpdate } from '../../database/schemas/field_updates.js';
import { fieldStatusAIService } from './status-ai-service.js';

export class FieldService {
  async createField(data: NewField) {
    return await fieldRepository.createField(data);
  }

  async getAllFields() {
    return await fieldRepository.findAllFields();
  }

  async getFieldById(id: number) {
    const field = await fieldRepository.findFieldById(id);
    if (!field) {
      throw new Error('Field not found');
    }
    return field;
  }

  async getFieldsByAgent(agentId: number) {
    return await fieldRepository.findFieldsByAgent(agentId);
  }

  async updateField(id: number, data: Partial<Field>) {
    const field = await fieldRepository.findFieldById(id);
    if (!field) {
      throw new Error('Field not found');
    }
    const updatedField = await fieldRepository.updateField(id, data);
    
    // Recalculate status if stage changed
    if (data.currentStage) {
      await this.refreshFieldStatus(id);
    }
    
    return updatedField;
  }

  async assignField(id: number, agentId: number) {
    const field = await fieldRepository.findFieldById(id);
    if (!field) {
      throw new Error('Field not found');
    }
    return await fieldRepository.updateField(id, { assignedAgentId: agentId });
  }

  async addFieldUpdate(fieldId: number, agentId: number, data: Omit<NewFieldUpdate, 'fieldId' | 'agentId'>) {
    const field = await fieldRepository.findFieldById(fieldId);
    if (!field) {
      throw new Error('Field not found');
    }

    const update = await fieldUpdateRepository.createUpdate({
      ...data,
      fieldId,
      agentId,
    });

    if (data.stageUpdate) {
      await fieldRepository.updateField(fieldId, { currentStage: data.stageUpdate });
    }

    // Always recompute status when a new update is added
    await this.refreshFieldStatus(fieldId);

    return update;
  }

  async getFieldUpdates(fieldId: number) {
    return await fieldUpdateRepository.findUpdatesByField(fieldId);
  }

  async getUpdatesByAgent(agentId: number) {
    return await fieldUpdateRepository.findUpdatesByAgent(agentId);
  }

  async refreshFieldStatus(fieldId: number) {
    const field = await fieldRepository.findFieldById(fieldId);
    if (!field) return;

    const updates = await fieldUpdateRepository.findUpdatesByField(fieldId);
    const { status: newStatus, reason } = await fieldStatusAIService.computeStatus(field, updates);

    if (field.status !== newStatus || field.aiRiskReason !== reason) {
      await fieldRepository.updateField(fieldId, { status: newStatus, aiRiskReason: reason });
    }
  }
}

export const fieldService = new FieldService();
