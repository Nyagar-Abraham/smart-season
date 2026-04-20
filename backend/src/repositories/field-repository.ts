import { eq, desc } from 'drizzle-orm';
import { db } from '../database/db.js';
import { fieldsTable, type NewField, type Field } from '../database/schemas/fields.js';
import { fieldUpdatesTable, type NewFieldUpdate } from '../database/schemas/field_updates.js';

export const fieldRepository = {
  async createField(field: NewField) {
    const [newField] = await db.insert(fieldsTable).values({...field, plantingDate: new Date(field.plantingDate)}).returning();
    return newField;
  },

  async findFieldById(id: number) {
    return await db.query.fieldsTable.findFirst({
      where: eq(fieldsTable.id, id),
    });
  },

  async findFieldsByAgent(agentId: number) {
    return await db.query.fieldsTable.findMany({
      where: eq(fieldsTable.assignedAgentId, agentId),
    });
  },

  async findAllFields() {
    return await db.query.fieldsTable.findMany();
  },

  async updateField(id: number, data: Partial<Field>) {
    const updateData: any = { ...data };
    if (data.plantingDate) {
      updateData.plantingDate = new Date(data.plantingDate);
    }
    const [updatedField] = await db
      .update(fieldsTable)
      .set(updateData)
      .where(eq(fieldsTable.id, id))
      .returning();
    return updatedField;
  }
};

export const fieldUpdateRepository = {
  async createUpdate(update: NewFieldUpdate) {
    const [newUpdate] = await db.insert(fieldUpdatesTable).values(update).returning();
    return newUpdate;
  },

  async findUpdatesByField(fieldId: number) {
    return await db.query.fieldUpdatesTable.findMany({
      where: eq(fieldUpdatesTable.fieldId, fieldId),
      orderBy: [desc(fieldUpdatesTable.createdAt)],
    });
  },

  async findUpdatesByAgent(agentId: number) {
    return await db.query.fieldUpdatesTable.findMany({
      where: eq(fieldUpdatesTable.agentId, agentId),
      orderBy: [desc(fieldUpdatesTable.createdAt)],
    });
  }
};
