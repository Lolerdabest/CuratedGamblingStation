'use client';

import * as React from 'react';
import { findGameByCode } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function GameCodeForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    if (!code || code.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a game code.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const result = await findGameByCode(code.trim());
      if (result.success && result.url) {
        router.push(result.url);
      } else if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
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
        required
        disabled={isLoading}
      />
      <Button type="submit" size="icon" aria-label="Search" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
      </Button>
    </form>
  );
}
