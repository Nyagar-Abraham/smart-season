import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { timestamps } from './commons.js';
import { fieldsTable, fieldStageEnum } from './fields.js';
import { usersTable } from './users.js';

export const fieldUpdatesTable = table(
  'field_updates',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    fieldId: t.integer().notNull().references(() => fieldsTable.id),
    agentId: t.integer().notNull().references(() => usersTable.id),
    stageUpdate: fieldStageEnum(),
    notes: t.text(),
    ...timestamps,
  },
  (table) => [
    t.index('idx_field_updates_field').on(table.fieldId),
    t.index('idx_field_updates_agent').on(table.agentId),
  ],
);

export type FieldUpdate = typeof fieldUpdatesTable.$inferSelect;
export type NewFieldUpdate = typeof fieldUpdatesTable.$inferInsert;
