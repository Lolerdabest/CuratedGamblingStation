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

  if (bet.status !== 'confirmed' && bet.status !== 'won' && bet.status !== 'lost') {
    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md text-center bg-secondary border-primary/20">
                <CardHeader>
                    <CardTitle className='font-headline text-primary text-2xl'>Game Not Ready</CardTitle>
                    <CardDescription>
                        This game is not yet confirmed by an admin. Please wait for confirmation after payment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className='text-sm'>Current status: <span className='font-semibold'>{bet.status}</span></p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GameContainer bet={bet} />
    </div>
  );
}
