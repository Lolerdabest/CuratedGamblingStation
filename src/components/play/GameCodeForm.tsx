'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { findGameByCode } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: true,
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="icon" aria-label="Search" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
    </Button>
  );
}

export function GameCodeForm() {
  const [state, formAction] = useFormState(findGameByCode, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!state.success && state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        name="code"
        placeholder="Enter your game code..."
        className="flex-grow"
        required
      />
      <SubmitButton />
    </form>
  );
}
