export type GameId = 'dragon-tower' | 'dice' | 'roulette' | 'mines';

export interface Game {
  id: GameId;
  name: string;
  description: string;
  minBet: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface User {
  minecraftUsername: string;
  discordTag: string;
}

export type BetStatus = 'pending' | 'confirmed' | 'won' | 'lost' | 'verifying' | 'verified' | 'verification_failed';

export interface Bet {
  id: string;
  userId: string; // minecraftUsername
  discordTag: string;
  gameId: GameId;
  gameName: string;
  amount: number;
  status: BetStatus;
  outcome?: any;
  payout?: number;
  createdAt: number; // timestamp
}
