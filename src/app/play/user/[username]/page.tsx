import { getUserBets } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowRight, CheckCircle, CircleDashed, Hourglass, ThumbsDown, ThumbsUp, ShieldCheck } from 'lucide-react';
import { Game, games } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function UserGamesPage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  const userBets = await getUserBets(username);
  const gameIcons = new Map(games.map(g => [g.id, g.icon]));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-headline font-bold mb-2">
        Welcome, <span className="text-primary">{username}</span>
      </h1>
      <p className="text-muted-foreground mb-8">Here are your games and bet history.</p>

      {userBets.length === 0 ? (
        <Card className="text-center py-12 bg-secondary border-primary/20">
          <CardHeader>
            <CardTitle>No Games Found</CardTitle>
            <CardDescription>
              You haven't placed any bets yet. Head to the home page to start playing!
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Play Now</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          {userBets.map((bet) => {
             const GameIcon = gameIcons.get(bet.gameId) || Hourglass;
             const isPlayable = bet.status === 'confirmed';
             const isPending = bet.status === 'pending';
             const isFinished = bet.status === 'won' || bet.status === 'lost';
            return (
              <Card key={bet.id} className="bg-secondary border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4 flex-1">
                   <GameIcon className="w-8 h-8 text-primary shrink-0"/>
                  <div>
                    <h3 className="font-semibold">{bet.gameName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Bet <span className="font-mono text-primary">{bet.amount}</span> &bull; {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {isPending && <Badge variant="secondary"><CircleDashed className="mr-2 h-4 w-4" />Awaiting Confirmation</Badge>}
                    {isPlayable && <Badge variant="outline" className="text-accent border-accent"><Hourglass className="mr-2 h-4 w-4" />Ready to Play</Badge>}
                    {bet.status === 'won' && <Badge className="bg-green-600/80"><ThumbsUp className="mr-2 h-4 w-4" />Won {bet.payout?.toLocaleString()}</Badge>}
                    {bet.status === 'lost' && <Badge variant="destructive"><ThumbsDown className="mr-2 h-4 w-4" />Lost</Badge>}
                  
                    <Button asChild variant={isPlayable || isPending ? 'default' : 'outline'} className="w-full md:w-auto">
                        <Link href={`/play/game/${bet.id}`}>
                            {isPending && 'Confirm Bet'}
                            {isPlayable && 'Play'}
                            {isFinished && 'View Result'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
