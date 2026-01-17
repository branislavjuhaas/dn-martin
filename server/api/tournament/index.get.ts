import type { RowDataPacket } from 'mysql2';
import db from '~~/server/db/db';
import type { Debater, Team, Tournament } from '#shared/types';

/**
 * Handler to retrieve full tournament details.
 * Fetches tournament metadata, teams, and assigns debaters to their respective teams.
 */
export default defineEventHandler(async (event) => {
  // 1. Fetch Debaters
  // Retrieve all debaters, skipping the first row (placeholder/template) usually handled by slice(1)
  const [debaterRows] = await db.query<RowDataPacket[]>('SELECT * FROM debaters');
  const debaters = debaterRows.slice(1) as Debater[];

  // 2. Fetch Teams & Map Debaters
  // Retrieve all teams and populate their 'debaters' property by filtering the previously fetched list
  const [teamsRows] = await db.query<RowDataPacket[]>('SELECT * FROM teams');
  const teams = teamsRows.map((teamRow) => {
    const team = teamRow as Team;
    team.debaters = debaters.filter(debater => debater.team === team.name);
    return team;
  }) as Team[];

  // 3. Fetch Tournament Metadata
  // Get the main tournament record and attach the fully populated teams array
  const [tournamentRows] = await db.query<RowDataPacket[]>('SELECT * FROM tournaments');
  const tournament = tournamentRows[0] ? (tournamentRows[0] as Tournament) : undefined;
  if (tournament) tournament.teams = teams;

  return { success: true, statusCode: 200, statusMessage: 'OK', tournament };
});
