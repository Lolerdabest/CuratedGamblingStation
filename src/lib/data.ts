import { Game, Bet } from '@/lib/types';
import { Bomb, Circle, Gift, Spade, Ticket, TowerControl, Bird } from 'lucide-react';

export const games: Game[] = [
  {
    id: 'mines',
    name: 'Mines',
    description: 'Uncover gems and avoid the mines. The more you find, the more you win.',
    minBet: 250,
    icon: Bomb,
  },
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'Bet on your lucky number or color on the spinning wheel.',
    minBet: 250,
    icon: Circle,
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
  {
    id: 'dragon-tower',
    name: 'Dragon Tower',
    description: 'Climb the tower by picking the right tiles, but avoid the skulls.',
    minBet: 250,
    icon: TowerControl,
  },
  {
    id: 'chicken-cross',
    name: 'Chicken Cross',
    description: 'Help the chicken cross the road and avoid the cars.',
    minBet: 250,
    icon: Bird,
  },
  {
    id: 'pop-the-balloon',
    name: 'Pop the Balloon',
    description: 'Pop balloons to increase your multiplier, but avoid the duds.',
    minBet: 250,
    icon: Gift,
  },
];

// NOTE: Mock bets have been removed. All bets will now be created through the UI.
export const mockBets: Bet[] = [];
