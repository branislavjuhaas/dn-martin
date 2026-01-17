import db from '~~/server/db/db';

export default defineEventHandler(async (event) => {
  // Verify the session to ensure authorized access
  await requireUserSession(event);

  // 1. Validate Request Params
  const { id } = event.context.params as { id: string };

  // 2. Update Team Name
  await db.query('DELETE FROM debaters WHERE id = ?', [id]);

  return { success: true, statusCode: 200, statusMessage: 'OK' };
});
