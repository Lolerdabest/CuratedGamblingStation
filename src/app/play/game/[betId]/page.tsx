import { getBet } from '@/lib/actions';
import { notFound } from 'next/navigation';
import GameContainer from '@/components/games/GameContainer';

export const dynamic = 'force-dynamic';

export default async function GamePage({ params }: { params: { betId: string } }) {
  const bet = await getBet(params.betId);

  if (!bet) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GameContainer bet={bet} />
    </div>
  );
}
