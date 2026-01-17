import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL or MYSQL_URL environment variable');
}

const db = mysql.createPool(connectionString);

export default db;
