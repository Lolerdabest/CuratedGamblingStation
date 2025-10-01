import { Game, Bet } from '@/lib/types';
import { TowerControl, Dice5, Bomb } from 'lucide-react';
import { Icons } from '@/components/icons';

export const games: Game[] = [
  {
    id: 'dragon-tower',
    name: 'Dragon Tower',
    description: 'Climb the tower, avoiding skulls to increase your multiplier.',
    minBet: 250,
    icon: TowerControl,
  },
  {
    id: 'dice',
    name: 'Dice',
    description: 'Predict the outcome of a roll of two dice. Simple and fast.',
    minBet: 250,
    icon: Dice5,
  },
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'Bet on your lucky number or color on the spinning wheel.',
    minBet: 250,
    icon: Icons.roulette,
  },
  {
    id: 'mines',
    name: 'Mines',
    description: 'Uncover gems and avoid the mines. The more you find, the more you win.',
    minBet: 250,
    icon: Bomb,
  },
];

export const mockBets: Bet[] = [
    {
        id: 'bet_1',
        userId: 'Notch',
        discordTag: 'notch#0001',
        gameId: 'dice',
        gameName: 'Dice',
        amount: 500,
        status: 'pending',
        createdAt: Date.now() - 1000 * 60 * 5,
    },
    {
        id: 'bet_2',
        userId: 'Jeb_',
        discordTag: 'jeb#0002',
        gameId: 'roulette',
        gameName: 'Roulette',
        amount: 1000,
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 15,
    },
    {
        id: 'bet_3',
        userId: 'Herobrine',
        discordTag: 'herobrine#6666',
        gameId: 'mines',
        gameName: 'Mines',
        amount: 250,
        status: 'won',
        payout: 500,
        outcome: { result: 'won' },
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
        id: 'bet_4',
        userId: 'Steve',
        discordTag: 'steve#1234',
        gameId: 'dragon-tower',
        gameName: 'Dragon Tower',
        amount: 750,
        status: 'lost',
        payout: 0,
        outcome: { result: 'lost' },
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
];
