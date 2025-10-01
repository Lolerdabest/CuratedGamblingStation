'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { games } from './data';
import type { Bet } from './types';
import { headers } from 'next/headers';

// In a real app, this would be a database (e.g., Firestore)
// By putting it in a separate object, we can better simulate a persistent store in dev.
const db = {
  bets: [] as Bet[] // Removed mock bets
};

// --- Helper to get base URL ---
function getBaseUrl() {
  const heads = headers();
  const protocol = heads.get('x-forwarded-proto') || 'http';
  const host = heads.get('host');
  return `${protocol}://${host}`;
}


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
    
    const baseUrl = getBaseUrl();
    const confirmationUrl = `${baseUrl}/api/confirm?betId=${bet.id}`;

    try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: '⏳ New Bet Awaiting Confirmation',
                    color: 0xFFA500, // Orange
                    description: `Click the button below to confirm you have received the payment from the player.`,
                    fields: [
                        { name: 'Player', value: bet.userId, inline: true },
                        { name: 'Discord', value: bet.discordTag || 'N/A', inline: true },
                        { name: 'Game', value: bet.gameName, inline: true },
                        { name: 'Bet Amount', value: bet.amount.toLocaleString(), inline: true },
                    ],
                    footer: { text: `Bet ID: ${bet.id}` },
                    timestamp: new Date().toISOString()
                }],
                components: [
                    {
                        type: 1, // Action Row
                        components: [
                            {
                                type: 2, // Button
                                label: "Confirm Payment",
                                style: 5, // Link
                                url: confirmationUrl
                            }
                        ]
                    }
                ]
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

  db.bets.unshift(newBet);
  
  await sendBetPlacementWebhook(newBet);

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

export async function confirmBet(betId: string): Promise<{ success: boolean, error?: string, bet?: Bet }> {
    const betIndex = db.bets.findIndex(b => b.id === betId);
    if (betIndex === -1) {
        return { success: false, error: "Bet not found." };
    }
    
    const bet = db.bets[betIndex];

    if (bet.status !== 'pending') {
        return { success: false, error: "Bet is not pending confirmation." };
    }

    // Update the bet status
    db.bets[betIndex] = { ...bet, status: 'confirmed' };
    const confirmedBet = db.bets[betIndex];
    
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
                        description: `**${bet.userId}** is now able to play their game.`,
                        fields: [
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

    revalidatePath(`/play/user/${bet.userId}`);

    return { success: true, bet: confirmedBet };
}


export async function resolveGame(betId: string, result: 'win' | 'loss', payout: number) {
    const betIndex = db.bets.findIndex((b) => b.id === betId);
    if (betIndex === -1) {
        return { success: false, error: 'Bet not found.' };
    }
    const bet = db.bets[betIndex];

    db.bets[betIndex] = { ...bet, status: result === 'win' ? 'won' : 'lost', payout: payout };
    
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
    revalidatePath(`/play/user/${bet.userId}`);

    return { success: true, bet: db.bets[betIndex] };
}
