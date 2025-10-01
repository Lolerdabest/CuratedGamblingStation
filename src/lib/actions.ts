'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { games } from './data';
import type { Bet } from './types';
import { getBets, setBets } from './db';
import dotenv from 'dotenv';

dotenv.config();

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

// --- Webhook ---
async function sendDiscordWebhook(embed: any) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.warn('Discord webhook URL not configured. Skipping notification.');
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed with status ${response.status}:`, await response.text());
    }
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
  }
}

// --- Schemas ---
const placeBetSchema = z.object({
  userId: z.string().min(3, 'Username must be at least 3 characters.'),
  discordTag: z.string().min(2, 'Discord tag is required.'),
  gameId: z.enum(['pop-the-balloon', 'roulette', 'mines', 'blackjack', 'keno', 'dragon-tower', 'chicken-cross']),
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

  const allBets = await getBets();
  const accessCode = generateAccessCode();

  const newBet: Bet = {
    id: `bet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    discordTag,
    gameId,
    gameName: game.name,
    amount,
    gameOptions,
    status: 'confirmed', // Auto-confirm
    accessCode,
    createdAt: Date.now(),
  };

  allBets.unshift(newBet);
  await setBets(allBets);
  
  await sendDiscordWebhook({
    title: 'New Bet Placed - Ready for Confirmation',
    color: 0xf1c40f, // Yellow
    description: `A new bet has been placed. Please verify the player has paid **\`${newBet.amount.toLocaleString()}\`** in-game before sending them the access code.`,
    fields: [
        { name: 'Player', value: newBet.userId, inline: true },
        { name: 'Discord', value: newBet.discordTag, inline: true },
        { name: 'Game', value: newBet.gameName, inline: true },
        { name: 'Access Code', value: `**\`${newBet.accessCode}\`**`, inline: false },
        { name: 'Game Options', value: '`' + JSON.stringify(newBet.gameOptions ?? {}) + '`' }
    ],
    timestamp: new Date().toISOString(),
  });

  revalidatePath(`/play/user/${userId}`);

  return { success: true, bet: newBet };
}

export async function getBet(betId: string): Promise<Bet | undefined> {
    const allBets = await getBets();
    return allBets.find((b) => b.id === betId);
}

export async function getUserBets(username: string): Promise<Bet[]> {
  const allBets = await getBets();
  return allBets.filter((b) => b.userId.toLowerCase() === username.toLowerCase()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllBets(): Promise<Bet[]> {
    const allBets = await getBets();
    return allBets.sort((a, b) => b.createdAt - a.createdAt);
}

// This function is no longer needed with the new flow.
// export async function confirmBet(betId: string) { ... }


export async function findGameByCode(code: string) {
  const allBets = await getBets();
  const bet = allBets.find(b => b.accessCode === code && b.status === 'confirmed');

  if (bet) {
    return { success: true, url: `/play/game/${bet.id}` };
  } else {
    // Check if the game was already played
    const playedBet = allBets.find(b => b.accessCode === code && (b.status === 'won' || b.status === 'lost'));
    if(playedBet) {
        return { success: false, error: 'This game code has already been used.' };
    }
    return { success: false, error: 'Invalid game code.' };
  }
}


export async function resolveGame(betId: string, result: 'win' | 'loss' | 'push', payout: number, gameOptions?: Record<string, any>) {
    const allBets = await getBets();
    const betIndex = allBets.findIndex((b) => b.id === betId);
    if (betIndex === -1) {
        return { success: false, error: 'Bet not found.' };
    }
    const bet = allBets[betIndex];

    // Prevent re-resolving a game
    if (bet.status === 'won' || bet.status === 'lost') {
      return { success: false, error: 'Game has already been resolved.' };
    }

    const statusMap = {
        'win': 'won',
        'loss': 'lost',
        'push': 'won' // Treat push as a "win" of the original amount
    } as const;

    const status = statusMap[result];

    allBets[betIndex] = { ...bet, status: status, payout: payout };
     if (gameOptions) {
        allBets[betIndex].gameOptions = { ...bet.gameOptions, ...gameOptions };
    }
    const updatedBet = allBets[betIndex];

    await setBets(allBets);
    
    const colorMap = { 'win': 0x2ecc71, 'loss': 0xe74c3c, 'push': 0xaaaaaa };

    await sendDiscordWebhook({
        title: `Game Finished: ${result.charAt(0).toUpperCase() + result.slice(1)}`,
        color: colorMap[result],
        fields: [
            { name: 'Player', value: updatedBet.userId, inline: true },
            { name: 'Game', value: updatedBet.gameName, inline: true },
            { name: 'Amount Bet', value: updatedBet.amount.toLocaleString(), inline: true },
            { name: 'Payout', value: updatedBet.payout?.toLocaleString() ?? '0', inline: true },
            { name: 'Game Details', value: '`' + JSON.stringify(updatedBet.gameOptions) + '`'}
        ],
        timestamp: new Date().toISOString(),
    });
    
    revalidatePath(`/play/game/${betId}`);
    revalidatePath(`/play/user/${bet.userId}`);

    return { success: true, bet: updatedBet };
}
