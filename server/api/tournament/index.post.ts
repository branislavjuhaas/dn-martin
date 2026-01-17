import * as z from 'zod';
import type { RowDataPacket } from 'mysql2';
import db from '~~/server/db/db';

/**
 * Input validation schema
 */
const tournamentSchema = z.object({
  tournament_name: z.string(),
  tournament_id: z.string(),
  teams: z.array(z.object({
    name: z.string(),
    debaters: z.array(z.object({
      name: z.string(),
      surname: z.string()
    }))
  }))
});

/**
 * Handler to reset and re-populate tournament data (Teams and Debaters)
 */
export default defineEventHandler(async (event) => {
  // 1. Validate Input
  const body = await readValidatedBody(event, tournamentSchema.parse);

  // 2. Prepare Data
  const tournament_name = body.tournament_name;
  const tournament_id = `${body.tournament_id.toUpperCase()}-DN/JU`;

  // Prepare bulk insert arrays
  const teamValues = body.teams.map(t => [t.name]);

  // Combine static placeholder debater with dynamic debaters from teams
  const debaterValues = [
    ['X', 'Iný rečník/', 'rečníčka'],
    ...body.teams.flatMap(team =>
      team.debaters.map(d => [team.name, d.name, d.surname])
    )
  ];

  // 3. Database Operations
  // Update tournament details
  await db.execute<RowDataPacket[]>(
    'UPDATE tournaments SET tournament_name = ?, tournament_id = ?',
    [tournament_name, tournament_id]
  );

  // Clear existing data
  // Note: Delete 'debaters' first to respect potential Foreign Keys pointing to 'teams'
  await db.execute('DELETE FROM debaters');
  await db.execute('DELETE FROM teams');

  // Insert fresh data
  if (teamValues.length > 0) {
    await db.query('INSERT INTO teams (name) VALUES ?', [teamValues]);
  }

  if (debaterValues.length > 0) {
    await db.query('INSERT INTO debaters (team, name, surname) VALUES ?', [debaterValues]);
  }

  return { success: true, statusCode: 200, statusMessage: 'OK' };
});
