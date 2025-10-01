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

  // If bet is pending, show the confirmation screen.
  // Otherwise (confirmed, won, lost), show the game container.
  if (bet.status === 'pending') {
    return (
        <div className="container mx-auto px-4 py-8">
            <ConfirmationProvider bet={bet} />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GameContainer bet={bet} />
    </div>
  );
}
