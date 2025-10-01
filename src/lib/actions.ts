'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { games, mockBets } from './data';
import type { Bet, BetStatus, GameId } from './types';

// In a real app, this would be a database (e.g., Firestore)
let bets: Bet[] = [...mockBets];

// --- Schemas ---
const placeBetSchema = z.object({
  userId: z.string(),
  discordTag: z.string(),
  gameId: z.enum(['dragon-tower', 'dice', 'roulette', 'mines']),
  amount: z.number(),
});

// --- Public Actions ---

export async function placeBet(input: z.infer<typeof placeBetSchema>) {
  const validatedInput = placeBetSchema.safeParse(input);
  if (!validatedInput.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { userId, discordTag, gameId, amount } = validatedInput.data;
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
    status: 'confirmed', // Auto-confirming the bet
    createdAt: Date.now(),
  };

  bets.unshift(newBet);
  revalidatePath(`/play/user/${encodeURIComponent(userId)}`);
  return { success: true, bet: newBet };
}

export async function getBetsForAdmin(): Promise<Bet[]> {
  // This function is no longer used by the UI but kept for potential future use.
  return [...bets].sort((a, b) => b.createdAt - a.createdAt);
}

export async function confirmBet(betId: string): Promise<{ success: boolean; message: string; newStatus?: BetStatus }> {
    // This function is no longer called from the UI.
    // Kept for potential future use or direct invocation if needed.
    const bet = bets.find((b) => b.id === betId);
    if (!bet) {
      return { success: false, message: 'Bet not found.' };
    }
  
    bet.status = 'confirmed';
    revalidatePath(`/play/user/${encodeURIComponent(bet.userId)}`);
    return { success: true, message: 'Bet confirmed!', newStatus: 'confirmed' };
}
  

export async function getUserBets(username: string): Promise<Bet[]> {
  return bets.filter((b) => b.userId.toLowerCase() === username.toLowerCase())
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getBet(betId: string): Promise<Bet | undefined> {
    return bets.find((b) => b.id === betId);
}

export async function resolveGame(betId: string, result: 'win' | 'loss', payout: number) {
    const bet = bets.find((b) => b.id === betId);
    if (!bet) {
        return { success: false, error: 'Bet not found.' };
    }

    bet.status = result === 'win' ? 'won' : 'lost';
    bet.payout = payout;
    
    if(result === 'win' && process.env.DISCORD_WEBHOOK_URL){
        try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: '🎉 Player Won!',
                        color: 0x5865F2,
                        fields: [
                            { name: 'Player', value: bet.userId, inline: true },
                            { name: 'Game', value: bet.gameName, inline: true },
                            { name: 'Bet Amount', value: bet.amount.toLocaleString(), inline: true },
                            { name: 'Payout', value: payout.toLocaleString(), inline: true },
                        ],
                        timestamp: new Date().toISOString()
                    }]
                })
            });
        } catch (error) {
            console.error('Failed to send Discord webhook:', error);
        }
    }
    
    revalidatePath(`/play/user/${encodeURIComponent(bet.userId)}`);
    revalidatePath(`/play/game/${betId}`);

    return { success: true, bet };
}
