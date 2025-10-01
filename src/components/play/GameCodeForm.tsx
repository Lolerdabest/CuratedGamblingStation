'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { findGameByCode } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: true,
  error: '',
};

export function GameCodeForm() {
  const [state, formAction] = useFormState(findGameByCode, initialState);
  const [isPending, setIsPending] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!state.success && state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
      setIsPending(false);
    }
  }, [state, toast]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    // @ts-ignore
    formAction(formData.get('code') as string);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        name="code"
        placeholder="Enter your game code..."
        className="flex-grow"
        required
      />
      <Button type="submit" size="icon" aria-label="Search" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
      </Button>
    </form>
  );
}
