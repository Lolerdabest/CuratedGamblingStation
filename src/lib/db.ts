'use server';

import type { Bet } from './types';

// This is a simple in-memory database.
// It's not suitable for production use on serverless platforms like Vercel,
// as the memory is not persisted across requests or deployments.
let bets: Bet[] = [];

export function getBets(): Bet[] {
  return bets;
}

export function setBets(newBets: Bet[]): void {
  bets = newBets;
}
