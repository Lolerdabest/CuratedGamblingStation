'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { games } from './data';
import type { Bet } from './types';
import { db } from './db';
import { redirect } from 'next/navigation';

const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


// --- Schemas ---
const placeBetSchema = z.object({
  userId: z.string().min(3, 'Username must be at least 3 characters.'),
  discordTag: z.string().min(2, 'Discord tag is required.'),
  gameId: z.enum(['dragon-tower', 'dice', 'roulette', 'mines']),
  amount: z.number(),
  gameOptions: z.record(z.any()).optional(),
});


// --- Public Actions ---

export async function placeBet(input: z.infer<typeof placeBetSchema>) {
  const validatedInput = placeBetSchema.safeParse(input);
  if (!validatedInput.success) {
    return { success: false, error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }

  const { userId, discordTag, gameId, amount, gameOptions } = validatedInput.data;
  const game = games.find((g) => g.id === gameId);
  if (!game) {
    return { success: false, error: 'Game not found.' };
  }

  const newBet: Bet = {
    id: `bet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    discordTag,
    gameId,
    gameName: game.name,
    amount,
    gameOptions,
    status: 'pending',
    createdAt: Date.now(),
  };

  db.bets.unshift(newBet);
  
  revalidatePath('/admin');
  revalidatePath(`/play/user/${userId}`);

  return { success: true, bet: newBet };
}

export async function getBet(betId: string): Promise<Bet | undefined> {
    return db.bets.find((b) => b.id === betId);
}

export async function getUserBets(username: string): Promise<Bet[]> {
  return db.bets.filter((b) => b.userId.toLowerCase() === username.toLowerCase()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllBets(): Promise<Bet[]> {
    return db.bets.sort((a, b) => b.createdAt - a.createdAt);
}

export async function confirmBet(betId: string) {
    const betIndex = db.bets.findIndex((b) => b.id === betId);
    if (betIndex === -1) {
        return { success: false, error: 'Bet not found.' };
    }
    
    const accessCode = generateAccessCode();
    db.bets[betIndex].status = 'confirmed';
    db.bets[betIndex].accessCode = accessCode;

    revalidatePath('/admin');
    revalidatePath(`/play/user/${db.bets[betIndex].userId}`);

    return { success: true, accessCode };
}


export async function findGameByCode(code: string) {
  const bet = db.bets.find(b => b.accessCode === code && b.status === 'confirmed');

  if (bet) {
    redirect(`/play/game/${bet.id}`);
  } else {
    return { success: false, error: 'Invalid or unconfirmed game code.' };
  }
}


export async function resolveGame(betId: string, result: 'win' | 'loss', payout: number) {
    const betIndex = db.bets.findIndex((b) => b.id === betId);
    if (betIndex === -1) {
        return { success: false, error: 'Bet not found.' };
    }
    const bet = db.bets[betIndex];

    db.bets[betIndex] = { ...bet, status: result === 'win' ? 'won' : 'lost', payout: payout };
    
    revalidatePath('/admin');
    revalidatePath(`/play/game/${betId}`);
    revalidatePath(`/play/user/${bet.userId}`);

    return { success: true, bet: db.bets[betIndex] };
}
