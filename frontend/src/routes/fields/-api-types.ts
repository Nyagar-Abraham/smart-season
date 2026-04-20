export type FieldStage = 'Planted' | 'Growing' | 'Ready' | 'Harvested';
export type FieldStatus = 'Active' | 'At Risk' | 'Completed';

export interface Field {
  id: number;
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage: FieldStage;
  status: FieldStatus;
  aiRiskReason: string | null;
  assignedAgentId: number | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldWithAgent extends Field {
  agentName?: string;
}

export interface CreateFieldRequest {
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage?: FieldStage;
  assignedAgentId?: number | null;
  images?: File[];
}

export interface UpdateFieldRequest extends Partial<CreateFieldRequest> {}

export interface AssignFieldRequest {
  agentId: number | null;
}

export interface FieldUpdate {
  id: number;
  fieldId: number;
  agentId: number;
  stageUpdate: FieldStage | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateFieldUpdateRequest {
  stageUpdate?: FieldStage;
  notes?: string;
}
