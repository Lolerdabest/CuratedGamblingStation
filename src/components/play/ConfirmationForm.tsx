'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { confirmBetWithCode } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ConfirmationFormProps {
  betId: string;
}

const formSchema = z.object({
  code: z.string().length(6, 'The code must be 6 digits.'),
});

export function ConfirmationForm({ betId }: ConfirmationFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await confirmBetWithCode(betId, values.code);
      if (result.success) {
        toast({ title: 'Success!', description: 'Your game is now ready to play.' });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Invalid confirmation code.',
        });
      }
    });
  };

  return (
    <Card className="max-w-md mx-auto bg-secondary border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Confirm Your Bet</CardTitle>
        <CardDescription>
          An admin has been notified of your bet. Please get the 6-digit confirmation code from them and enter it below to start playing.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123456" className="text-center font-mono text-lg" maxLength={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm and Play
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
