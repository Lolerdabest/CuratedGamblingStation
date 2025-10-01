'use server';

import { kv } from '@vercel/kv';
import type { Bet } from './types';

const BETS_KEY = 'bets_all_db';

export async function getBets(): Promise<Bet[]> {
  return (await kv.get<Bet[]>(BETS_KEY)) ?? [];
}

export async function setBets(bets: Bet[]): Promise<unknown> {
  return await kv.set(BETS_KEY, bets);
}
