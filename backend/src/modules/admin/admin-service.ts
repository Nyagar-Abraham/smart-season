import { userRepository } from '../../repositories/user-repository.js';

export class AdminService {
  async getAllAgents() {
    return await userRepository.findFieldAgents();
  }
}

export const adminService = new AdminService();
