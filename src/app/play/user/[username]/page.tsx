import { getUserBets } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Gamepad2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UserHistoryPage({ params }: { params: { username: string } }) {
  const bets = await getUserBets(params.username);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-headline font-bold mb-6">
        <span className="text-muted-foreground">Games for:</span> <span className="text-primary">{decodeURIComponent(params.username)}</span>
      </h1>
      
      {bets.length === 0 ? (
        <p className="text-center text-muted-foreground mt-12">No games found for this user.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bets.map(bet => (
            <Card key={bet.id} className="flex flex-col bg-secondary border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{bet.gameName}</span>
                   <Badge
                      variant="outline"
                      className={cn('capitalize border-2', {
                        'border-blue-500 text-blue-400': bet.status === 'confirmed',
                        'border-green-500 text-green-400': bet.status === 'won',
                        'border-red-500 text-red-400': bet.status === 'lost',
                      })}
                    >
                      {bet.status}
                    </Badge>
                </CardTitle>
                <CardDescription>
                  Bet Amount: <span className="font-mono text-primary">{bet.amount.toLocaleString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 {bet.status === 'won' && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 text-green-400">
                        <CheckCircle className="w-5 h-5 shrink-0"/>
                        <p className="text-sm">You won! Payout: <span className='font-mono'>{bet.payout?.toLocaleString()}</span></p>
                    </div>
                 )}
                 {bet.status === 'lost' && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-red-500/10 text-red-400">
                        <AlertCircle className="w-5 h-5 shrink-0"/>
                        <p className="text-sm">You lost this game. Better luck next time.</p>
                    </div>
                 )}
                 {bet.status === 'confirmed' && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-blue-500/10 text-blue-400">
                        <CheckCircle className="w-5 h-5 shrink-0"/>
                        <p className="text-sm">Your game is ready to be played!</p>
                    </div>
                 )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" disabled={bet.status !== 'confirmed'}>
                  <Link href={`/play/game/${bet.id}`}>
                    <Gamepad2 className="mr-2"/>
                    {bet.status === 'confirmed' ? 'Play Now' : 'Not Ready'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
