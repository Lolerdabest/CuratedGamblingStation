'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Game } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { placeBet } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BetModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function BetModal({ game, isOpen, onClose }: BetModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const formSchema = z.object({
    minecraftUsername: z.string().min(3, {
      message: 'Minecraft username must be at least 3 characters.',
    }),
    discordTag: z.string().min(2, { message: 'Discord username is required.' }),
    amount: z
      .number({ coerce: true })
      .min(game.minBet, { message: `Minimum bet is ${game.minBet}.` }),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minecraftUsername: '',
      discordTag: '',
      amount: game.minBet,
    },
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      form.reset();
      setIsSubmitting(false);
    }, 300);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await placeBet({
        userId: values.minecraftUsername,
        discordTag: values.discordTag,
        gameId: game.id,
        amount: values.amount,
      });

      if (result.success && result.bet) {
        toast({
            title: 'Bet Placed!',
            description: 'Your game is ready. Good luck!',
        });
        handleClose();
        router.push(`/play/game/${result.bet.id}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error placing bet',
          description: result.error || 'An unknown error occurred.',
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error placing bet',
        description: 'Could not connect to the server. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-secondary border-primary/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                  <game.icon className="w-6 h-6" />
                  Place your bet on {game.name}
                </DialogTitle>
                <DialogDescription>
                  Enter your details and bet amount. Your game will be available to play immediately.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="minecraftUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minecraft Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Notch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discordTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord Username</FormLabel>
                      <FormControl>
                        <Input placeholder="notch#0001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bet Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min={game.minBet} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait, redirecting...
                    </>
                  ) : (
                    'Place Bet & Play'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}
