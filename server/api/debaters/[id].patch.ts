import * as z from 'zod';
import db from '~~/server/db/db';
import type { ResultSetHeader } from 'mysql2';

const debaterSchema = z.object({
  name: z.string(),
  surname: z.string()
});

export default defineEventHandler(async (event) => {
  // Verify the session to ensure authorized access
  await requireUserSession(event);

  // 1. Validate Request Body and Params
  const body = await readValidatedBody(event, debaterSchema.parse);
  const { id } = event.context.params as { id: string };

  // 2. Update Team Name
  await db.query<ResultSetHeader>('UPDATE debaters SET name = ?, surname = ? WHERE id = ?', [body.name, body.surname, id]);

  return { success: true, statusCode: 200, statusMessage: 'OK', debater: { id, name: body.name, surname: body.surname } };
});
