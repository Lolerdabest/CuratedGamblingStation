'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { games, mockBets } from './data';
import type { Bet } from './types';
import { redirect } from 'next/navigation';

// In a real app, this would be a database (e.g., Firestore)
let bets: Bet[] = [...mockBets];

// --- Schemas ---
const placeBetSchema = z.object({
  userId: z.string().min(3, 'Username must be at least 3 characters.'),
  discordTag: z.string().min(2, 'Discord tag is required.'),
  gameId: z.enum(['dragon-tower', 'dice', 'roulette', 'mines']),
  amount: z.number(),
});

// --- Helper Functions ---
async function sendBetPlacementWebhook(bet: Bet) {
    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.warn('DISCORD_WEBHOOK_URL not set. Skipping webhook notification.');
        return;
    }

    try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: '⏳ New Bet Awaiting Confirmation',
                    color: 0xFFA500, // Orange
                    description: 'Go to the admin panel to confirm this payment.',
                    fields: [
                        { name: 'Player', value: bet.userId, inline: true },
                        { name: 'Discord', value: bet.discordTag || 'N/A', inline: true },
                        { name: 'Game', value: bet.gameName, inline: true },
                        { name: 'Bet Amount', value: bet.amount.toLocaleString(), inline: true },
                    ],
                    footer: { text: `Bet ID: ${bet.id}` },
                    timestamp: new Date().toISOString()
                }]
            })
        });
    } catch (error) {
        console.error('Failed to send Discord webhook for bet placement:', error);
    }
}


// --- Public Actions ---

export async function placeBet(input: z.infer<typeof placeBetSchema>) {
  const validatedInput = placeBetSchema.safeParse(input);
  if (!validatedInput.success) {
    return { success: false, error: validatedInput.error.errors.map(e => e.message).join(', ') };
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
    status: 'pending', // Default to pending for admin confirmation
    createdAt: Date.now(),
  };

  bets.unshift(newBet);
  
  await sendBetPlacementWebhook(newBet);

  revalidatePath('/admin');
  return { success: true, bet: newBet };
}

export async function getBet(betId: string): Promise<Bet | undefined> {
    return bets.find((b) => b.id === betId);
}

export async function getUserBets(username: string): Promise<Bet[]> {
  return bets.filter((b) => b.userId.toLowerCase() === username.toLowerCase());
}

export async function getAllBets(): Promise<Bet[]> {
    return bets.sort((a, b) => b.createdAt - a.createdAt);
}

export async function confirmBet(betId: string): Promise<{ success: boolean, error?: string }> {
    const bet = bets.find(b => b.id === betId);
    if (!bet) {
        return { success: false, error: "Bet not found." };
    }
    if (bet.status !== 'pending') {
        return { success: false, error: "Bet is not pending confirmation." };
    }

    bet.status = 'confirmed';
    
    // Optional: Send a confirmation webhook to Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
         try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: '✅ Bet Confirmed',
                        color: 0x00FF00, // Green
                        description: `${bet.userId} is now able to play their game.`,
                        fields: [
                            { name: 'Player', value: bet.userId, inline: true },
                            { name: 'Game', value: bet.gameName, inline: true },
                            { name: 'Bet Amount', value: bet.amount.toLocaleString(), inline: true },
                        ],
                        timestamp: new Date().toISOString()
                    }]
                })
            });
        } catch (error) {
            console.error('Failed to send Discord webhook for confirmation:', error);
        }
    }


    revalidatePath('/admin');
    revalidatePath(`/play/user/${bet.userId}`);

    return { success: true };
}


export async function resolveGame(betId: string, result: 'win' | 'loss', payout: number) {
    const bet = bets.find((b) => b.id === betId);
    if (!bet) {
        return { success: false, error: 'Bet not found.' };
    }

    bet.status = result === 'win' ? 'won' : 'lost';
    bet.payout = payout;
    
    if(result === 'win' && payout > 0 && process.env.DISCORD_WEBHOOK_URL){
        try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: '🎉 Player Won!',
                        color: 0x00FF00,
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
    
    revalidatePath(`/play/game/${betId}`);
    revalidatePath('/admin');

    return { success: true, bet };
}
