import type { RowDataPacket } from 'mysql2';
import db from '~~/server/db/db';
import type { Debater, Team, Tournament } from '#shared/types';

export default defineEventHandler(async (event) => {
  const [debaterRows] = await db.query<RowDataPacket[]>('SELECT * FROM debaters');
  const debaters = debaterRows.slice(1) as Debater[];

  const [teamsRows] = await db.query<RowDataPacket[]>('SELECT * FROM teams');
  const teams = teamsRows.map((teamRow) => {
    const team = teamRow as Team;
    team.debaters = debaters.filter(debater => debater.team === team.name);
    return team;
  }) as Team[];

  const [tournamentRows] = await db.query<RowDataPacket[]>('SELECT * FROM tournaments');
  const tournament = tournamentRows[0] ? (tournamentRows[0] as Tournament) : undefined;
  if (tournament) tournament.teams = teams;

  return { success: true, statusCode: 200, statusMessage: 'OK', data: { tournament } };
});
