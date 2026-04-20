import { api } from '@/lib/api/api-service';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from './-api-request-response-types';

export const AUTH_API_METHODS = {
  signup,
  login,
};

async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await api.post<SignupResponse>('/auth/signup', payload);
  return response.data;
}

async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}
