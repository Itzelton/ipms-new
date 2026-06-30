import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, '.pgdata');

const config = {
  databaseDir: dataDir,
  user: 'ipms',
  password: 'ipms',
  port: 5432,
  persistent: true,
};

async function startDatabase() {
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  const pg = new EmbeddedPostgres(config);
  await pg.initialise();
  await pg.start();

  const client = pg.getPgClient();
  await client.connect();
  const dbCheck = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', ['ipms']);
  if (dbCheck.rowCount === 0) {
    await client.query('CREATE DATABASE ipms');
    console.log('Created database: ipms');
  }
  await client.end();

  console.log('PostgreSQL is running on localhost:5432');
  console.log('DATABASE_URL=postgresql://ipms:ipms@localhost:5432/ipms?schema=public');
  console.log('Press Ctrl+C to stop.');

  const shutdown = async () => {
    console.log('\nStopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await new Promise(() => {});
}

startDatabase().catch((error) => {
  console.error('Failed to start embedded PostgreSQL:', error);
  process.exit(1);
});
