import { Game, Bet } from '@/lib/types';
import { Bomb, Gift, Spade, Ticket } from 'lucide-react';
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
  {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Get closer to 21 than the dealer without going over.',
    minBet: 500,
    icon: Spade,
  },
  {
    id: 'keno',
    name: 'Keno',
    description: 'Pick your lucky numbers and see how many you can match.',
    minBet: 250,
    icon: Ticket,
  },
];

// NOTE: Mock bets have been removed. All bets will now be created through the UI.
export const mockBets: Bet[] = [];
