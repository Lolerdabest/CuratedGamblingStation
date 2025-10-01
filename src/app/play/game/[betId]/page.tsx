import { getBet } from '@/lib/actions';
import { notFound } from 'next/navigation';
import GameContainer from '@/components/games/GameContainer';
import { ConfirmationProvider } from '@/components/play/ConfirmationProvider';
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

  // The confirmation step has been removed from the user flow.
  // The user gets the code and goes straight to the game.
  // The 'pending' status is now an internal state before the code is used.
  // For simplicity, we'll just show the game container directly.
  // If the bet status needs a separate confirmation screen in the future,
  // the logic can be re-introduced here.
  // if (bet.status === 'pending') {
  //   return (
  //       <div className="container mx-auto px-4 py-8">
  //           <ConfirmationProvider bet={bet} />
  //       </div>
  //   )
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <GameContainer bet={bet} />
    </div>
  );
}
