import db from '~~/server/db/db';
import type { RowDataPacket } from 'mysql2';

export default defineEventHandler(async (event) => {
  // Verify the session to ensure authorized access
  await requireUserSession(event);

  // 1. Validate Request Params
  const { id } = event.context.params as { id: string };

  // 2. Get Team Info
  const [teamRows] = await db.query<RowDataPacket[]>('SELECT * FROM teams WHERE id = ?', [id]);
  const team = teamRows[0] ? (teamRows[0] as { id: number; name: string }) : undefined;

  // 3. Update Team Name
  await db.query('DELETE FROM teams WHERE id = ?', [id]);

  // 4. Update Debater Info
  if (team) {
    await db.query('DELETE FROM debaters WHERE team = ?', [team.name]);
  }

  return { success: true, statusCode: 200, statusMessage: 'OK' };
});
