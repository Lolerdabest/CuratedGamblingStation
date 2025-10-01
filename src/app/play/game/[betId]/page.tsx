import { getBet } from '@/lib/actions';
import { notFound } from 'next/navigation';
import GameContainer from '@/components/games/GameContainer';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  

export const dynamic = 'force-dynamic';

export default async function GamePage({ params }: { params: { betId: string } }) {
  const bet = await getBet(params.betId);

  if (!bet) {
    notFound();
  }

  // Since bets are auto-confirmed, we no longer need a "not ready" state.
  // We just need to handle the case where the game is already finished.

  return (
    <div className="container mx-auto px-4 py-8">
      <GameContainer bet={bet} />
    </div>
  );
}
