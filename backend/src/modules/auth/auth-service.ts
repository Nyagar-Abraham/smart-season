import bcrypt from 'bcryptjs';
import { type NewUser } from '../../database/schemas/users.js';
import { userRepository } from '../../repositories/user-repository.js';
import { generateToken } from './jwt-service.js';

interface SignUpData {
 fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'field_agent' ;
}

export class AuthService {
  async signup(data: SignUpData) {
    const existingUser = await userRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await userRepository.createUser({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: data.role as NewUser['role'],
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findUserByEmail(email);

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user: userWithoutPassword, token };
  }
}

export const authService = new AuthService();
