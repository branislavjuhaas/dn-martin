import * as z from 'zod';
import db from '~~/server/db/db';
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import type { User } from '#shared/types';

const authSchema = z.object({
  username: z.string(),
  password: z.string()
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, authSchema.parse);

  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [body.username]);
  const user = rows[0] ? (rows[0] as User) : undefined;

  if (!user || !user.password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
  }

  if (!bcrypt.compareSync(body.password, user.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
  }

  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'You do not have permission to access this page' });
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.fullname
    }
  });

  return { success: true, statusCode: 200, statusMessage: 'OK' };
});
