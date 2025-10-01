'use client';

import { getUserBets } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Gamepad2, Hourglass, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bet } from '@/lib/types';

export default function UserHistoryPage({ params }: { params: { username: string } }) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBets() {
      setIsLoading(true);
      const userBets = await getUserBets(params.username);
      setBets(userBets);
      setIsLoading(false);
    }
    fetchBets();
  }, [params.username]);


  if (isLoading) {
      return (
          <div className="container mx-auto px-4 py-8">
               <h1 className="text-3xl font-headline font-bold mb-6">
                <span className="text-muted-foreground">Games for:</span> <span className="text-primary">{decodeURIComponent(params.username)}</span>
                </h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="flex flex-col bg-secondary border-primary/20 animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted-foreground/20 rounded-md w-3/4"></div>
                                <div className="h-4 bg-muted-foreground/20 rounded-md w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                               <div className="h-12 bg-muted-foreground/20 rounded-md w-full"></div>
                            </CardContent>
                             <CardFooter>
                                <div className="h-10 bg-muted-foreground/20 rounded-md w-full"></div>
                             </CardFooter>
                        </Card>
                    ))}
                </div>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-headline font-bold mb-6">
        <span className="text-muted-foreground">Games for:</span> <span className="text-primary">{decodeURIComponent(params.username)}</span>
      </h1>
      
      {bets.length === 0 ? (
        <Card className="mt-12 text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">No games found for this user.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Back to Home</Link>
                </Button>
            </CardContent>
        </Card>
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
                        'border-yellow-500 text-yellow-400': bet.status === 'pending',
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
                 {bet.status === 'pending' && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-yellow-500/10 text-yellow-400">
                        <Hourglass className="w-5 h-5 shrink-0"/>
                        <p className="text-sm">Your bet is awaiting admin confirmation.</p>
                    </div>
                 )}
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
                        <ShieldCheck className="w-5 h-5 shrink-0"/>
                        <p className="text-sm">Your game is confirmed and ready!</p>
                    </div>
                 )}
              </CardContent>
              <CardFooter>
                 <div className="w-full">
                    {bet.status === 'confirmed' ? (
                       <Button asChild className="w-full">
                        <Link href={`/play/game/${bet.id}`}>
                            <Gamepad2 className="mr-2"/>
                            Play Now
                        </Link>
                        </Button>
                    ) : (
                        <div className='text-center w-full'>
                            <p className="text-xs text-muted-foreground">Your game code will be provided by an admin once your bet is confirmed.</p>
                             {bet.accessCode && <p className='font-mono text-primary text-lg mt-2'>{bet.accessCode}</p>}
                        </div>
                    )}
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}