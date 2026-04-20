import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';
import * as usersSchema from './schemas/users.js';
import * as fieldsSchema from './schemas/fields.js';
import * as fieldUpdatesSchema from './schemas/field_updates.js';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...usersSchema,
    ...fieldsSchema,
    ...fieldUpdatesSchema,
  },
});
