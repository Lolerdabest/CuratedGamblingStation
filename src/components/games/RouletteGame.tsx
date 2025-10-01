'use client';

import { useState, useTransition } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RouletteGameProps {
  bet: Bet;
}

type BetChoice = 'red' | 'black';

const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const numberColors: { [key: number]: 'red' | 'black' | 'green' } = {0: 'green', 1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red', 31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'};

export default function RouletteGame({ bet }: RouletteGameProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const [betChoice, setBetChoice] = useState<BetChoice | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ number: number; color: string } | null>(null);

  const handleSpin = () => {
    if (!betChoice) {
      toast({ variant: 'destructive', title: 'No bet placed', description: 'Please select red or black.' });
      return;
    }
    setIsSpinning(true);

    const winner = numbers[Math.floor(Math.random() * numbers.length)];
    const winnerColor = numberColors[winner];

    setTimeout(() => {
        setResult({ number: winner, color: winnerColor });
        setIsSpinning(false);
        
        startTransition(async () => {
            const didWin = winnerColor === betChoice;
            const payout = didWin ? bet.amount * 2 : 0;
            
            const gameOptions = { bet: betChoice };
            await resolveGame(bet.id, didWin ? 'win' : 'loss', payout, gameOptions);
            
            toast({ 
                title: `The ball landed on ${winner} (${winnerColor})`, 
                description: didWin ? `You won ${payout}!` : "You lost." 
            });
        });
    }, 2000); // Simulate spin duration
  };

  return (
    <Card className="max-w-md mx-auto bg-secondary border-primary/20 text-center">
      <CardContent className="p-6 space-y-6">
        <div className="h-24 flex items-center justify-center">
          {result ? (
            <div className="animate-scale-in">
              <p className="text-sm text-muted-foreground">Landed on</p>
              <p className={cn("text-5xl font-bold", {
                'text-red-500': result.color === 'red',
                'text-slate-300': result.color === 'black',
                'text-green-500': result.color === 'green',
              })}>
                {result.number}
              </p>
            </div>
          ) : (
             <p className="text-muted-foreground">
                {isSpinning ? "Spinning..." : "Place your bet"}
             </p>
          )}
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setBetChoice('red')}
              disabled={isSpinning || result !== null}
              className={cn(
                "py-6 text-lg text-white font-bold transition-all",
                "bg-red-600 hover:bg-red-700",
                betChoice !== 'red' && betChoice !== null && "opacity-50 scale-95",
                betChoice === 'red' && "ring-2 ring-offset-2 ring-offset-background ring-accent"
              )}
            >
              Red
            </Button>
            <Button
              onClick={() => setBetChoice('black')}
              disabled={isSpinning || result !== null}
              className={cn(
                "py-6 text-lg text-white font-bold transition-all",
                "bg-gray-800 hover:bg-gray-700",
                 betChoice !== 'black' && betChoice !== null && "opacity-50 scale-95",
                 betChoice === 'black' && "ring-2 ring-offset-2 ring-offset-background ring-accent"
              )}
            >
              Black
            </Button>
          </div>
        </div>

        <Button onClick={handleSpin} disabled={isSpinning || isPending || result !== null || !betChoice} className="w-full">
          {(isSpinning || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSpinning ? 'Spinning...' : result !== null ? 'Game Over' : 'Spin the Wheel'}
        </Button>
      </CardContent>
    </Card>
  );
}