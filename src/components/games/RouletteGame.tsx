'use client';

import { useState, useTransition } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface RouletteGameProps {
  bet: Bet;
}

type BetChoice = 'red' | 'black';

const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const numberColors: { [key: number]: 'red' | 'black' | 'green' } = {0: 'green', 1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red', 31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'};


const RouletteWheelIcon = ({ spinning }: { spinning: boolean }) => (
  <>
    <style jsx>{`
      .wheel {
        animation: ${spinning ? 'spin 2s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'};
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(1080deg);
        }
      }
    `}</style>
    <svg
      className="wheel w-48 h-48"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="2" />
      <circle cx="50" cy="50" r="40" fill="hsl(var(--background))" />
      
      {numbers.map((num, i) => {
        const angle = (i / numbers.length) * 360;
        const color = numberColors[num];
        let slotColor = 'hsl(var(--muted-foreground))';
        if (color === 'red') slotColor = 'hsl(0 63% 31%)';
        if (color === 'black') slotColor = '#333';
        if (color === 'green') slotColor = 'hsl(140 63% 31%)';

        return (
          <path
            key={num}
            d={`M50,50 L${50 + 40 * Math.cos(angle * Math.PI / 180 - (0.5 / numbers.length * Math.PI))},${50 + 40 * Math.sin(angle * Math.PI / 180 - (0.5 / numbers.length * Math.PI))} A40,40 0 0,1 ${50 + 40 * Math.cos((angle + 360 / numbers.length) * Math.PI / 180 - (0.5 / numbers.length * Math.PI))},${50 + 40 * Math.sin((angle + 360 / numbers.length) * Math.PI / 180 - (0.5 / numbers.length * Math.PI))} Z`}
            fill={slotColor}
          />
        );
      })}
      
      <circle cx="50" cy="50" r="15" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
      <circle cx="50" cy="50" r="10" fill="hsl(var(--primary))" />
      
      {/* Ball */}
      <circle cx="50" cy="20" r="3" fill="white" />
    </svg>
  </>
);


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
    setResult(null);

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
        <div className="h-48 flex items-center justify-center">
          {isSpinning ? (
             <RouletteWheelIcon spinning={true} />
          ) : result ? (
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
             <RouletteWheelIcon spinning={false} />
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
