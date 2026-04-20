import * as t from 'drizzle-orm/pg-core';

export const timestamps = {
  updatedAt: t.timestamp().$onUpdate(() => new Date(new Date().toISOString())),
  createdAt: t.timestamp().defaultNow().notNull(),
};
