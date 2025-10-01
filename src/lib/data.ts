import { Game, Bet } from '@/lib/types';
import { Gift, Bomb } from 'lucide-react';
import { Icons } from '@/components/icons';

export const games: Game[] = [
  {
    id: 'pop-the-balloon',
    name: 'Pop the Balloon',
    description: 'Pop balloons to increase your multiplier, but avoid the duds.',
    minBet: 250,
    icon: Gift,
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

// NOTE: Mock bets have been removed. All bets will now be created through the UI.
export const mockBets: Bet[] = [];
