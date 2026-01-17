import * as z from 'zod';
import type { ResultSetHeader } from 'mysql2';
import db from '~~/server/db/db';

const teamSchema = z.object({
  name: z.string()
});

export default defineEventHandler(async (event) => {
  // Verify the session to ensure authorized access
  await requireUserSession(event);

  // 1. Validate Request Body
  const body = await readValidatedBody(event, teamSchema.parse);

  // 2. Insert New Team
  const [result] = await db.query<ResultSetHeader>('INSERT INTO teams (name) VALUES (?)', [body.name]);

  return { success: true, statusCode: 200, statusMessage: 'OK', teamId: result.insertId };
});
