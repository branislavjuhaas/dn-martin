import * as z from 'zod';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '~~/server/db/db';

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

  // 2. Get Team Info
  const [teamRows] = await db.query<RowDataPacket[]>('SELECT * FROM teams WHERE id = ?', [id]);
  const team = teamRows[0] ? (teamRows[0] as { id: number; name: string }) : undefined;

  if (!team) {
    throw createError({ statusCode: 404, statusMessage: 'Team not found' });
  }

  // 3. Insert New Debater
  const [result] = await db.query<ResultSetHeader>(
    'INSERT INTO debaters (team, name, surname) VALUES (?, ?, ?)',
    [team?.name, body.name, body.surname]
  );

  return { success: true, statusCode: 200, statusMessage: 'OK', debaterId: result.insertId };
});
