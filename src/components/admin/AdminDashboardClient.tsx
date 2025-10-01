'use client';

import * as React from 'react';
import { Bet, BetStatus } from '@/lib/types';
import { confirmBet } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CircleDashed, Loader2, Hourglass, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function AdminDashboardClient({ initialBets }: { initialBets: Bet[] }) {
  const [bets, setBets] = React.useState<Bet[]>(initialBets);
  const [isConfirming, setIsConfirming] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirm = async (betId: string) => {
    setIsConfirming(betId);

    const result = await confirmBet(betId);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      // Update local state to reflect the change immediately
      setBets(currentBets => 
        currentBets.map(b => 
          b.id === betId ? { ...b, status: 'confirmed' } : b
        )
      );
       router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Confirmation Failed',
        description: result.message,
      });
    } finally {
        setIsConfirming(null);
    }
  };

  const getStatusBadge = (status: BetStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><CircleDashed className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-accent border-accent"><Hourglass className="mr-1 h-3 w-3" />Confirmed</Badge>;
      case 'won':
        return <Badge className="bg-green-600/80"><ThumbsUp className="mr-1 h-3 w-3" />Won</Badge>;
      case 'lost':
        return <Badge variant="destructive"><ThumbsDown className="mr-1 h-3 w-3" />Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-lg border bg-secondary">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Game</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No bets placed yet.
              </TableCell>
            </TableRow>
          ) : (
            bets.map((bet) => (
              <TableRow key={bet.id}>
                <TableCell>
                  <div className="font-medium">{bet.userId}</div>
                  <div className="text-sm text-muted-foreground">{bet.discordTag}</div>
                </TableCell>
                <TableCell>{bet.gameName}</TableCell>
                <TableCell className="text-right font-mono">{bet.amount.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(bet.status)}</TableCell>
                <TableCell>{format(new Date(bet.createdAt), 'PPpp')}</TableCell>
                <TableCell className="text-center">
                  {bet.status === 'pending' ? (
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(bet.id)}
                      disabled={!!isConfirming}
                    >
                      {isConfirming === bet.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Confirm Payment'
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No action required</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
