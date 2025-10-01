
'use client';

import { useState, useTransition, useEffect } from 'react';
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

const ANGLE_PER_SEGMENT = 360 / numbers.length;

export default function RouletteGame({ bet }: RouletteGameProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const [betChoice, setBetChoice] = useState<BetChoice | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [ballAnimation, setBallAnimation] = useState<React.CSSProperties>({});
  const [animationName, setAnimationName] = useState('none');

  useEffect(() => {
    // Cleanup animation style tag on component unmount
    return () => {
      const styleTag = document.getElementById('roulette-spin-animation');
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, []);

  const handleSpin = () => {
    if (!betChoice) {
      toast({ variant: 'destructive', title: 'No bet placed', description: 'Please select red or black.' });
      return;
    }
    setIsSpinning(true);
    setWinningNumber(null);

    const winner = numbers[Math.floor(Math.random() * numbers.length)];
    const winnerIndex = numbers.indexOf(winner);

    const endAngle = (winnerIndex * ANGLE_PER_SEGMENT);
    const fullSpins = 4 * 360;
    const finalAngle = fullSpins + endAngle;

    const spinKeyframes = `
      @keyframes roulette-spin {
        0% { transform: rotate(0deg) translateX(95px) rotate(0deg); }
        80% { transform: rotate(${finalAngle}deg) translateX(95px) rotate(-${finalAngle}deg); }
        100% { transform: rotate(${finalAngle}deg) translateX(95px) rotate(-${finalAngle}deg); }
      }
    `;

    let styleTag = document.getElementById('roulette-spin-animation');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'roulette-spin-animation';
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = spinKeyframes;
    
    const newAnimationName = `roulette-spin-${Date.now()}`;
    styleTag.innerHTML = styleTag.innerHTML.replace('roulette-spin', newAnimationName);

    setAnimationName(newAnimationName);

    setTimeout(() => {
        setWinningNumber(winner);
        setIsSpinning(false);
        setAnimationName('none'); // Stop animation

        startTransition(async () => {
            const winnerColor = numberColors[winner];
            const didWin = winnerColor === betChoice;
            const payout = didWin ? bet.amount * 2 : 0;
            
            const gameOptions = { bet: betChoice };
            await resolveGame(bet.id, didWin ? 'win' : 'loss', payout, gameOptions);
            
            toast({ 
                title: `The ball landed on ${winner} (${winnerColor})`, 
                description: didWin ? `You won ${payout}!` : "You lost." 
            });
        });
    }, 4000);
  };

  return (
    <Card className="max-w-lg mx-auto bg-secondary border-primary/20 text-center">
      <CardContent className="p-6 space-y-6">
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <Icons.roulette className="w-full h-full" />
           <div
            className="absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-white shadow-lg"
            style={{ 
              animationName, 
              animationDuration: isSpinning ? '4s' : '0s',
              animationTimingFunction: isSpinning ? 'cubic-bezier(0.2, 0.8, 0.7, 1)' : 'linear',
              animationFillMode: 'forwards',
            }}
          ></div>
          {winningNumber !== null && !isSpinning && (
            <div className="absolute flex flex-col items-center justify-center animate-scale-in">
              <p className='text-sm text-muted-foreground'>Winner</p>
              <p className={cn("text-4xl font-bold", 
                  {
                      'text-red-500': numberColors[winningNumber] === 'red',
                      'text-slate-300': numberColors[winningNumber] === 'black',
                      'text-green-500': numberColors[winningNumber] === 'green'
                  }
              )}>{winningNumber}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-muted-foreground mb-4">Place your bet:</p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setBetChoice('red')}
              disabled={isSpinning || winningNumber !== null}
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
              disabled={isSpinning || winningNumber !== null}
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

        <Button onClick={handleSpin} disabled={isSpinning || isPending || winningNumber !== null || !betChoice} className="w-full">
          {(isSpinning || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSpinning ? 'Spinning...' : winningNumber !== null ? 'Game Over' : 'Spin the Wheel'}
        </Button>
      </CardContent>
    </Card>
  );
}

    