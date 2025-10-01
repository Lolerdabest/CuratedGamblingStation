'use server';

import type { Bet } from './types';

// This is a simple in-memory database.
// It's not suitable for production use on serverless platforms like Vercel,
// as the memory is not persisted across requests or deployments.
let bets: Bet[] = [];

export async function getBets(): Promise<Bet[]> {
  return bets;
}

export async function setBets(newBets: Bet[]): Promise<void> {
  bets = newBets;
}
