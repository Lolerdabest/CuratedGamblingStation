import { getAllBets } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import ConfirmButton from './_components/ConfirmButton';
import { CopyButton } from './_components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const bets = await getAllBets();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Bets</CardTitle>
          <CardDescription>
            Manage and confirm all player bets from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action / Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell>
                    <div className="font-medium">{bet.userId}</div>
                    <div className="text-sm text-muted-foreground">{bet.discordTag}</div>
                  </TableCell>
                  <TableCell>{bet.gameName}</TableCell>
                  <TableCell className="font-mono">{bet.amount.toLocaleString()}</TableCell>
                   <TableCell>{formatDistanceToNow(bet.createdAt, { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('capitalize border-2 font-semibold', {
                         'border-yellow-500 text-yellow-400': bet.status === 'pending',
                        'border-blue-500 text-blue-400': bet.status === 'confirmed',
                        'border-green-500 text-green-400': bet.status === 'won',
                        'border-red-500 text-red-400': bet.status === 'lost',
                      })}
                    >
                      {bet.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {bet.status === 'pending' && <ConfirmButton betId={bet.id} />}
                    {bet.status !== 'pending' && bet.accessCode && (
                       <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">{bet.accessCode}</span>
                        <CopyButton text={bet.accessCode}/>
                       </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {bets.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No bets have been placed yet.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
