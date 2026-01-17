import * as z from 'zod';
import db from '~~/server/db/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

const teamSchema = z.object({
  name: z.string()
});

export default defineEventHandler(async (event) => {
  // Verify the session to ensure authorized access
  await requireUserSession(event);

  // 1. Validate Request Body and Params
  const body = await readValidatedBody(event, teamSchema.parse);
  const { id } = event.context.params as { id: string };

  // 2. Get Team Info
  const [teamRows] = await db.query<RowDataPacket[]>('SELECT * FROM teams WHERE id = ?', [id]);
  const team = teamRows[0] ? (teamRows[0] as { id: number; name: string }) : undefined;

  // 3. Update Team Name
  await db.query<ResultSetHeader>('UPDATE teams SET name = ? WHERE id = ?', [body.name, id]);

  // 4. Update Debater Info
  if (team) {
    await db.query('UPDATE debaters SET team = ? WHERE team = ?', [body.name, team.name]);
  }

  return { success: true, statusCode: 200, statusMessage: 'OK', team: { id, name: body.name } };
});
