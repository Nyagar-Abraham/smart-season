import { api } from '@/lib/api/api-service';
import  type {
  Field,
  CreateFieldRequest,
  UpdateFieldRequest,
  AssignFieldRequest,
  FieldUpdate,
  CreateFieldUpdateRequest
} from './-api-types';

export const FIELDS_API_METHODS = {
  createField: async (data: CreateFieldRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    const response = await api.post<{ success: boolean; data: Field }>('/fields', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getAllFields: async () => {
    const response = await api.get<{ success: boolean; data: Field[] }>('/fields');
    return response.data;
  },
  getFieldById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Field }>(`/fields/${id}`);
    return response.data;
  },
  updateField: async (id: number, data: UpdateFieldRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    const response = await api.put<{ success: boolean; data: Field }>(`/fields/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  assignField: async (id: number, data: AssignFieldRequest) => {
    const response = await api.patch<{ success: boolean; data: Field }>(`/fields/${id}/assign`, data);
    return response.data;
  },
  createFieldUpdate: async (id: number, data: CreateFieldUpdateRequest) => {
    const response = await api.post<{ success: boolean; data: FieldUpdate }>(`/fields/${id}/updates`, data);
    return response.data;
  },
  getFieldUpdates: async (id: number) => {
    const response = await api.get<{ success: boolean; data: FieldUpdate[] }>(`/fields/${id}/updates`);
    return response.data;
  },
  getMyFields: async () => {
    const response = await api.get<{ success: boolean; data: Field[] }>('/fields/mine');
    return response.data;
  },
  getMyUpdates: async () => {
    const response = await api.get<{ success: boolean; data: FieldUpdate[] }>('/fields/updates/mine');
    return response.data;
  },
  refreshFieldStatus: async (id: number) => {
    const response = await api.post<{ success: boolean; data: Field }>(`/fields/${id}/refresh-status`);
    return response.data;
  }
};

export const AGENTS_API_METHODS = {
  getAllAgents: async () => {
     const response = await api.get<{ success: boolean; data: any[] }>('/admin/agents'); 
     return response.data;
  }
}
