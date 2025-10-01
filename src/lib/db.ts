
import type { Bet } from './types';

interface Database {
  bets: Bet[];
}

// In development, Next.js clears the cache on every change, which would reset our in-memory DB.
// Using globalThis ensures the DB is persistent across hot reloads.
declare const globalThis: {
  __db__: Database | undefined;
};

const db: Database = globalThis.__db__ || {
  bets: [],
};

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db__ = db;
}

export { db };
