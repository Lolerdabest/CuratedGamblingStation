'use client';

import * as React from 'react';
import { findGameByCode } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GameCodeForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [code, setCode] = React.useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a game code.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const result = await findGameByCode(code);
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
      // On success, the action redirects, so we don't need to handle it here.
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        name="code"
        placeholder="Enter your game code..."
        className="flex-grow"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        disabled={isLoading}
      />
      <Button type="submit" size="icon" aria-label="Search" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
      </Button>
    </form>
  );
}
