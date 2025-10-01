import { createKysely } from '@vercel/kv';
import type { Bet } from './types';

interface Database {
  bets: Bet[];
}

// This is a bit of a hack to make Vercel KV work with a simple key-value store approach
// while keeping the type safety of Kysely. We'll store all bets under a single key.
const DB_KEY = 'bets_db';

const db = createKysely<Database>();

async function getBets(): Promise<Bet[]> {
    const data = await db.selectFrom('bets').selectAll().execute();
    const allBetsRecord = await kv.get<Bet[]>(DB_KEY);
    return allBetsRecord ?? [];
}

async function setBets(bets: Bet[]): Promise<void> {
    await kv.set(DB_KEY, bets);
}

// We will export functions to interact with our KV store
// This abstracts away the Vercel KV specific logic
export const kv = {
    async getBets(): Promise<Bet[]> {
        const bets = await db.selectFrom('bets').selectAll().execute();
        // This is a temporary workaround as we're storing everything in one key
        // A real implementation would use Kysely's features more deeply
        const stored = await createKysely<{'all_bets': Bet[]}>().selectFrom('all_bets').selectAll().execute();
        if (stored.length > 0 && stored[0].bets) {
             return stored[0].bets;
        }
        return [];
    },

    async setBets(bets: Bet[]): Promise<void> {
        // Since we can't easily update a JSON array with Kysely,
        // we'll overwrite the whole object. This is not ideal for high-concurrency.
        // For this app's purpose, it's acceptable.
        
        // This is a raw approach as Kysely from @vercel/kv doesn't support simple set.
        const rawKv = createKysely<any>();
        // A direct set would be better, but this is the interface.
        // We'll clear and insert. A real app should use transactions.
        
        // This is a workaround because the `createKysely` doesn't provide a simple `set`
        const kvStore = createKysely<{[DB_KEY]: Bet[]}>();
        // This is not how Kysely is supposed to be used, but @vercel/kv is limited.
        // The correct way would be to model the data relationally.
        // For this key-value use case, we store the entire array of bets.
        
        // The Vercel KV package is a bit quirky. Let's use it as a simple key-value store.
        const vercelKv = createKysely<any>().getSignal(); // This is not a public API, just for demonstration
        await vercelKv.set(DB_KEY, bets);
    }
};

// The new `db.ts` using vercel/kv
import { kv as vercelKv } from '@vercel/kv';
import type { Bet } from './types';

const BETS_KEY = 'bets_all';

export const db = {
    async getBets(): Promise<Bet[]> {
        return await vercelKv.get<Bet[]>(BETS_KEY) ?? [];
    },
    async setBets(bets: Bet[]) {
        return await vercelKv.set(BETS_KEY, bets);
    }
};
