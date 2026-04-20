import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { timestamps } from './commons.ts';
import { usersTable } from './users.ts';

export const fieldStageEnum = pgEnum('field_stages', ['Planted', 'Growing', 'Ready', 'Harvested']);
export const fieldStatusEnum = pgEnum('field_status', ['Active', 'At Risk', 'Completed']);

export const fieldsTable = table(
  'fields',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar().notNull(),
    cropType: t.varchar().notNull(),
    plantingDate: t.timestamp().notNull(),
    currentStage: fieldStageEnum().notNull().default('Planted'),
    status: fieldStatusEnum().notNull().default('Active'),
    aiRiskReason: t.text(),
    assignedAgentId: t.integer().references(() => usersTable.id),
    images: t.text().array().notNull().default([]),
    ...timestamps,
  },
  (table) => [
    t.index('idx_fields_assigned_agent').on(table.assignedAgentId),
  ],
);

export type Field = typeof fieldsTable.$inferSelect;
export type NewField = typeof fieldsTable.$inferInsert;
