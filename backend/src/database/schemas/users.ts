import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { timestamps } from './commons.js';

export const roleEnum = pgEnum('roles', ['admin', 'field_agent']);

export const usersTable = table(
  'users',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    email: t.varchar().notNull().unique(),
    passwordHash: t.varchar().notNull(),
    fullName: t.varchar(),
    role: roleEnum().notNull().default('field_agent'),
    isActive: t.boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    t.index('idx_users_email').on(table.email),
  ],
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Role = (typeof roleEnum.enumValues)[number];
