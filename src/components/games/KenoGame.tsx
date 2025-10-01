'use client';

import { useState, useTransition, useMemo } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MAX_PICKS = 10;
const GRID_SIZE = 80;
const DRAW_SIZE = 20;

// Simplified payout table: { matches: multiplier }
const PAYOUT_TABLE: Record<number, Record<number, number>> = {
    // Numbers picked
    10: { 5: 2, 6: 5, 7: 15, 8: 50, 9: 100, 10: 200 },
    9: { 5: 3, 6: 10, 7: 25, 8: 75, 9: 150 },
    8: { 4: 2, 5: 5, 6: 12, 7: 50, 8: 100 },
    7: { 4: 2, 5: 8, 6: 20, 7: 75 },
    6: { 3: 1, 4: 3, 5: 15, 6: 50 },
    5: { 3: 2, 4: 5, 5: 25 },
    4: { 2: 1, 3: 4, 4: 10 },
    3: { 2: 2, 3: 5 },
    2: { 2: 3 },
    1: { 1: 2 },
};

export default function KenoGame({ bet }: KenoGameProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'picking' | 'drawing' | 'finished'>('picking');

  const handleNumberClick = (num: number) => {
    if (gameState !== 'picking') return;
    
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < MAX_PICKS) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleClear = () => {
      setSelectedNumbers([]);
  }

  const handleStart = () => {
    if (selectedNumbers.length === 0) {
      toast({ variant: 'destructive', title: 'Select at least one number.' });
      return;
    }
    setGameState('drawing');
    
    // Draw numbers with animation
    const allNumbers = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
    const shuffled = allNumbers.sort(() => Math.random() - 0.5);
    const winningNumbers = shuffled.slice(0, DRAW_SIZE);

    winningNumbers.forEach((num, index) => {
        setTimeout(() => {
            setDrawnNumbers(prev => [...prev, num]);
        }, index * 100);
    });

    setTimeout(() => {
        const hits = selectedNumbers.filter(n => winningNumbers.includes(n));
        const payoutTier = PAYOUT_TABLE[selectedNumbers.length];
        const multiplier = payoutTier ? (payoutTier[hits.length] || 0) : 0;
        const payout = bet.amount * multiplier;

        setGameState('finished');
        startTransition(async () => {
            await resolveGame(bet.id, payout > 0 ? 'win' : 'loss', payout);
            toast({
                title: `You matched ${hits.length} numbers!`,
                description: `You won ${payout.toLocaleString()}`,
            });
        });
    }, DRAW_SIZE * 100 + 500);
  };
  
  const hits = useMemo(() => selectedNumbers.filter(n => drawnNumbers.includes(n)), [selectedNumbers, drawnNumbers]);

  return (
    <Card className="max-w-2xl mx-auto bg-secondary border-primary/20">
      <CardContent className="p-6 space-y-4">
        <div className="p-4 bg-background/50 rounded-lg flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Numbers Picked</p>
            <p className="text-xl font-bold text-primary">{selectedNumbers.length} / {MAX_PICKS}</p>
          </div>
           <div>
            <p className="text-sm text-muted-foreground">Hits</p>
            <p className="text-xl font-bold text-green-400">{gameState === 'picking' ? '-' : hits.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: GRID_SIZE }, (_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isDrawn = drawnNumbers.includes(num);
            const isHit = isSelected && isDrawn;
            
            return (
              <button
                key={num}
                disabled={gameState !== 'picking'}
                onClick={() => handleNumberClick(num)}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-sm font-semibold transition-all duration-200 border",
                  "disabled:cursor-not-allowed",
                  isHit ? "bg-green-500/50 border-green-400 text-white animate-pulse" :
                  isSelected ? "bg-primary/50 border-primary" :
                  isDrawn ? "bg-muted-foreground/30 border-muted-foreground/50" : 
                  "bg-background/50 hover:bg-primary/20 border-primary/20"
                )}
              >
                {num}
              </button>
            )
          })}
        </div>

        {gameState === 'picking' ? (
          <div className='flex gap-2'>
            <Button onClick={handleStart} disabled={selectedNumbers.length === 0} className="w-full">
              Play ({selectedNumbers.length} numbers)
            </Button>
            <Button onClick={handleClear} variant="outline" disabled={selectedNumbers.length === 0} className="w-full">
                Clear
            </Button>
          </div>
        ) : (
            <Button disabled className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {gameState === 'drawing' && "Drawing numbers..."}
                {gameState === 'finished' && "Game Over"}
            </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface KenoGameProps {
    bet: Bet;
}
