import { eq } from 'drizzle-orm';
import { db } from '../database/db.js';
import { usersTable, type NewUser, type User } from '../database/schemas/users.js';

export const userRepository = {
  async createUser(user: NewUser) {
    const [newUser] = await db.insert(usersTable).values(user).returning();
    return newUser;
  },

  async findUserByEmail(email: string) {
    return await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
  },

  async findUserById(id: number) {
    return await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
  },

  async findAllUsers() {
    return await db.query.usersTable.findMany();
  },
  
  async findFieldAgents(){
    return await db.query.usersTable.findMany({
      where: eq(usersTable.role, 'field_agent'),
    });
  }
};
