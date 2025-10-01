'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Game } from '@/lib/types';
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
import { cn } from '@/lib/utils';

interface BetModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function BetModal({ game, isOpen, onClose }: BetModalProps) {
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState<{ amount: number; minecraftUsername: string } | null>(null);
  const { toast } = useToast();

  const formSchema = z.object({
    minecraftUsername: z.string().min(3, {
      message: 'Minecraft username must be at least 3 characters.',
    }),
    discordTag: z.string().regex(/^.{3,32}#\d{4}$/, {
      message: 'Please enter a valid Discord tag (e.g., user#1234).',
    }),
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
    // Delay resetting form to allow dialog to close smoothly
    setTimeout(() => {
      form.reset();
      setStep(1);
      setIsSubmitting(false);
      setSubmittedData(null);
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

      if (result.success) {
        setSubmittedData(values);
        setStep(2);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error placing bet',
          description: result.error || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error placing bet',
        description: 'Could not connect to the server. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-secondary border-primary/30">
        {step === 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                  <game.icon className="w-6 h-6" />
                  Place your bet on {game.name}
                </DialogTitle>
                <DialogDescription>
                  Enter your details and bet amount. Minimum bet is {game.minBet}.
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
                      <FormLabel>Discord Tag</FormLabel>
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
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Bet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        {step === 2 && submittedData && (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl text-primary">Bet Placed!</DialogTitle>
              <DialogDescription>
                Your bet has been submitted. Please complete the payment in Minecraft.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 p-4 bg-background/50 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">To finalize your bet, send <span className="font-bold text-primary">{submittedData.amount}</span> currency in-game using the command below:</p>
                <div className="p-3 bg-black rounded-md">
                    <code className="font-code text-accent">/pay Lolerdabest69 {submittedData.amount}</code>
                </div>
                <p className="text-xs text-muted-foreground pt-2">Once an admin confirms your payment, you can find your active game by searching for your username on the 'Play' page.</p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
