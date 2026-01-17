import * as z from 'zod';
import type { RowDataPacket } from 'mysql2';
import db from '~~/server/db/db';

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

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, tournamentSchema.parse);

  const tournament_name = body.tournament_name;
  const tournament_id = `${body.tournament_id.toUpperCase()}-DN/JU`;

  const teams = body.teams.map(team => ({ name: team.name }));
  const debaters = [
    { team: 'X', name: 'Iný rečník/', surname: 'rečníčka' },
    ...body.teams.flatMap(team => team.debaters.map(debater => ({ ...debater, team: team.name })))
  ];

  await db.execute<RowDataPacket[]>(
    'UPDATE tournaments SET tournament_name = ?, tournament_id = ?',
    [tournament_name, tournament_id]
  );

  await db.execute('DELETE FROM teams');
  await db.execute('DELETE FROM debaters');

  const teamValues = teams.map(t => [t.name]);
  if (teamValues.length > 0) {
    await db.query('INSERT INTO teams (name) VALUES ?', [teamValues]);
  }

  const debaterValues = debaters.map(d => [d.team, d.name, d.surname]);
  if (debaterValues.length > 0) {
    await db.query('INSERT INTO debaters (team, name, surname) VALUES ?', [debaterValues]);
  }

  return { success: true, statusCode: 200, statusMessage: 'OK' };
});
