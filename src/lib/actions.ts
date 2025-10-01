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
  userId: z.string(),
  discordTag: z.string(),
  gameId: z.enum(['dragon-tower', 'dice', 'roulette', 'mines']),
  amount: z.number(),
});

// --- Helper Functions ---
function generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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
                    title: '🚀 New Bet Placed - Give Code to Player',
                    color: 0x5865F2, // Blue
                    fields: [
                        { name: 'Player', value: bet.userId, inline: true },
                        { name: 'Discord', value: bet.discordTag || 'N/A', inline: true },
                        { name: 'Game', value: bet.gameName, inline: true },
                        { name: 'Bet Amount', value: bet.amount.toLocaleString(), inline: true },
                        { name: 'Game Code (Give to Player)', value: `\`\`\`${bet.confirmationCode}\`\`\`` },
                    ],
                    footer: { text: `Bet ID (Internal): ${bet.id}` },
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
    status: 'confirmed', // Bet is playable as soon as the code is given
    confirmationCode: generateConfirmationCode(),
    createdAt: Date.now(),
  };

  bets.unshift(newBet);
  
  // Send webhook notification
  await sendBetPlacementWebhook(newBet);

  revalidatePath(`/play/game/${newBet.id}`);
  return { success: true, bet: newBet };
}

export async function findGameByCode(code: string): Promise<{ success: boolean; error?: string }> {
    // Find the bet where the confirmationCode matches the code entered by the user
    const bet = bets.find(b => b.confirmationCode === code);

    if (bet) {
      // Redirect to the game page using the bet's actual ID
      redirect(`/play/game/${bet.id}`);
    } else {
      return { success: false, error: 'No game found with that code.' };
    }
}

export async function confirmBetWithCode(betId: string, code: string): Promise<{ success: boolean; error?: string }> {
    const bet = bets.find((b) => b.id === betId);

    if (!bet) {
        return { success: false, error: 'Bet not found.' };
    }
    if (bet.status !== 'pending') {
        return { success: true }; // Already confirmed
    }
    if (bet.confirmationCode !== code) {
        return { success: false, error: 'Invalid confirmation code.' };
    }

    bet.status = 'confirmed';

    revalidatePath(`/play/game/${betId}`);

    return { success: true };
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

    return { success: true, bet };
}
