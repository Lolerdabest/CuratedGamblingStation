
import type { Bet } from './types';

interface Database {
  bets: Bet[];
}

// This is a simplified in-memory database.
// By defining it in its own module, we ensure it's a singleton across server requests in development.
export const db: Database = {
  bets: [],
};
