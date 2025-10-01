'use client';

import { confirmBet } from '@/lib/actions';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConfirmButton({ betId }: { betId: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmBet(betId);
      if (result.success) {
        toast({ title: 'Bet Confirmed!', description: `Access code: ${result.accessCode}`});
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  return (
    <Button onClick={handleConfirm} disabled={isPending} size="sm">
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <ShieldCheck className="mr-2" />
      )}
      Confirm
    </Button>
  );
}
