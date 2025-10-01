'use client';

import { useState, useTransition } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

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
  const [winningNumber, setWinningNumber] = useState<number | null>(null);

  const handleSpin = () => {
    if (!betChoice) {
      toast({ variant: 'destructive', title: 'No bet placed', description: 'Please select red or black.' });
      return;
    }
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * numbers.length);
    const winner = numbers[randomIndex];
    
    setTimeout(() => {
        setWinningNumber(winner);
        setIsSpinning(false);

        startTransition(async () => {
            const winnerColor = numberColors[winner];
            const didWin = winnerColor === betChoice;
            const payout = didWin ? bet.amount * 2 : 0;
            await resolveGame(bet.id, didWin ? 'win' : 'loss', payout);
            toast({ title: `The ball landed on ${winner} (${winnerColor})`, description: didWin ? `You won ${payout}!` : "You lost." });
        });
    }, 4000);
  };

  return (
    <Card className="max-w-lg mx-auto bg-secondary border-primary/20 text-center">
      <CardContent className="p-6 space-y-6">
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <Icons.roulette className={cn("w-full h-full text-primary/30", isSpinning && "animate-[spin_4s_cubic-bezier(0.25,1,0.5,1)_forwards]")} />
            <div className="absolute w-4 h-4 bg-accent rounded-full shadow-lg" style={{
                animation: isSpinning ? 'spin-ball 4s cubic-bezier(0.6, 0, 0.4, 1) forwards' : 'none',
                transformOrigin: '0px 100px',
            }} />
             <style jsx>{`
                @keyframes spin-ball {
                    0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
                    100% { transform: rotate(1440deg) translateX(100px) rotate(-1440deg); }
                }
            `}</style>

            {winningNumber !== null && !isSpinning && (
                <div className="absolute flex flex-col items-center justify-center animate-fade-in-up">
                    <p className='text-sm text-muted-foreground'>Winner</p>
                    <p className={cn("text-4xl font-bold", 
                        numberColors[winningNumber] === 'red' ? 'text-red-500' :
                        numberColors[winningNumber] === 'black' ? 'text-gray-300' : 'text-green-500'
                    )}>{winningNumber}</p>
                </div>
            )}
        </div>

        <div>
          <p className="text-muted-foreground mb-4">Place your bet:</p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={betChoice === 'red' ? 'default' : 'outline'}
              onClick={() => setBetChoice('red')}
              disabled={isSpinning || winningNumber !== null}
              className="py-6 text-lg bg-red-500/80 hover:bg-red-500 text-white data-[state=selected]:ring-2 data-[state=selected]:ring-accent"
            >
              Red
            </Button>
            <Button
              variant={betChoice === 'black' ? 'default' : 'outline'}
              onClick={() => setBetChoice('black')}
              disabled={isSpinning || winningNumber !== null}
              className="py-6 text-lg bg-gray-700/80 hover:bg-gray-700 text-white"
            >
              Black
            </Button>
          </div>
        </div>

        <Button onClick={handleSpin} disabled={isSpinning || isPending || winningNumber !== null} className="w-full">
          {(isSpinning || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSpinning ? 'Spinning...' : winningNumber !== null ? 'Game Over' : 'Spin the Wheel'}
        </Button>
      </CardContent>
    </Card>
  );
}
