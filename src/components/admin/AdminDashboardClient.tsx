'use client';

import * as React from 'react';
import { Bet, BetStatus } from '@/lib/types';
import { verifyAndConfirmBet } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CircleDashed, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type ActionableBet = Bet & { isConfirming?: boolean };

export default function AdminDashboardClient({ initialBets }: { initialBets: Bet[] }) {
  const [bets, setBets] = React.useState<ActionableBet[]>(initialBets);
  const { toast } = useToast();

  const handleConfirm = async (betId: string) => {
    setBets((prev) => prev.map((b) => (b.id === betId ? { ...b, isConfirming: true } : b)));

    const result = await verifyAndConfirmBet(betId);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
       setBets((prev) => prev.map((b) => (b.id === betId ? { ...b, isConfirming: false, status: result.newStatus! } : b)));
    } else {
      toast({
        variant: 'destructive',
        title: 'Confirmation Failed',
        description: result.message,
      });
      setBets((prev) => prev.map((b) => (b.id === betId ? { ...b, isConfirming: false } : b)));
    }
  };

  const getStatusBadge = (status: BetStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><CircleDashed className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600/80"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
      case 'won':
        return <Badge className="bg-accent text-accent-foreground">Won</Badge>;
      case 'lost':
        return <Badge variant="destructive">Lost</Badge>;
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
                      disabled={bet.isConfirming}
                    >
                      {bet.isConfirming ? (
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
