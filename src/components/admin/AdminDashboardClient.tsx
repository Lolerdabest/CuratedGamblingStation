'use client';

import * as React from 'react';
import { confirmBet } from '@/lib/actions';
import type { Bet } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminDashboardClientProps {
  initialBets: Bet[];
}

export default function AdminDashboardClient({ initialBets }: AdminDashboardClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [bets, setBets] = React.useState(initialBets);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBets(initialBets);
  }, [initialBets]);

  const handleConfirm = async (betId: string) => {
    setConfirmingId(betId);
    try {
      const result = await confirmBet(betId);
      if (result.success) {
        toast({ title: 'Bet Confirmed!', description: 'The player can now access their game.' });
        // Optimistically update the UI while revalidation happens in the background
        setBets(currentBets =>
          currentBets.map(bet =>
            bet.id === betId ? { ...bet, status: 'confirmed' } : bet
          )
        );
        router.refresh(); // Force a server-side refresh to get the latest data
      } else {
        toast({
          variant: 'destructive',
          title: 'Confirmation Failed',
          description: result.error || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the server.',
      });
    } finally {
        setConfirmingId(null);
    }
  };

  const filteredBets = bets.filter(bet =>
    bet.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bet.discordTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bet.gameName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by player, discord, or game..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Game</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBets.length > 0 ? (
              filteredBets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell>
                    <div className="font-medium">{bet.userId}</div>
                    <div className="text-sm text-muted-foreground">{bet.discordTag}</div>
                  </TableCell>
                  <TableCell>{bet.gameName}</TableCell>
                  <TableCell className="font-mono">{bet.amount.toLocaleString()}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn('capitalize', {
                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/40': bet.status === 'pending',
                        'bg-blue-500/20 text-blue-300 border-blue-500/40': bet.status === 'confirmed',
                        'bg-green-500/20 text-green-300 border-green-500/40': bet.status === 'won',
                        'bg-red-500/20 text-red-300 border-red-500/40': bet.status === 'lost',
                      })}
                    >
                      {bet.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {bet.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(bet.id)}
                        disabled={confirmingId === bet.id}
                      >
                        {confirmingId === bet.id && <Loader2 className="mr-2 animate-spin"/>}
                        Confirm
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
