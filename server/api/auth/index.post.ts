import * as z from 'zod';
import db from '~~/server/db/db';
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import type { User } from '#shared/types';

/**
 * Input validation schema for login credentials
 */
const authSchema = z.object({
  username: z.string(),
  password: z.string()
});

/**
 * Handle admin authentication steps:
 * 1. Validate credentials against DB
 * 2. Verify password hash
 * 3. Enforce admin role authorization
 * 4. Create user session
 */
export default defineEventHandler(async (event) => {
  // 1. Validate Request Body
  const body = await readValidatedBody(event, authSchema.parse);

  // 2. Lookup User
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [body.username]);
  const user = rows[0] ? (rows[0] as User) : undefined;

  // 3. Verify Existence & Password
  if (!user || !user.password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
  }

  if (!bcrypt.compareSync(body.password, user.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
  }

  // 4. Verify Authorization (Admin Role)
  if (!['admin', 'tabmaster'].includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'You do not have permission to access this page' });
  }

  // 5. Create Session
  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.fullname
    }
  });

  return { success: true, statusCode: 200, statusMessage: 'OK' };
});
