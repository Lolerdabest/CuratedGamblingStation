'use client';

import { useState, useTransition, useMemo } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2, Bomb, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MinesGameProps {
  bet: Bet;
}

const GRID_SIZE = 25;

export default function MinesGame({ bet }: MinesGameProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const numMines = bet.gameOptions?.numMines ?? 3;
  
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  
  const minePositions = useMemo(() => {
      const positions = new Set<number>();
      while(positions.size < numMines) {
          positions.add(Math.floor(Math.random() * GRID_SIZE));
      }
      return positions;
  }, [numMines]);

  const gemsFound = useMemo(() => revealed.filter(index => !minePositions.has(index)).length, [revealed, minePositions]);
  const currentMultiplier = useMemo(() => {
    if (gemsFound === 0) return 1;
    // Simplified multiplier logic with lower returns
    return parseFloat((1 + (gemsFound * 0.05) * (numMines / 10)).toFixed(2));
  }, [gemsFound, numMines]);
  const potentialPayout = Math.floor(bet.amount * currentMultiplier);

  const handleTileClick = (index: number) => {
    if (gameOver || revealed.includes(index)) return;

    setRevealed(prev => [...prev, index]);

    if (minePositions.has(index)) {
      setGameOver(true);
      startTransition(async () => {
        await resolveGame(bet.id, 'loss', 0);
        toast({ variant: 'destructive', title: 'BOOM! You hit a mine.' });
      });
    }
  };
  
  const handleCashOut = () => {
    setGameOver(true);
    startTransition(async () => {
        const payout = potentialPayout;
        await resolveGame(bet.id, 'win', payout);
        toast({ title: 'Cashed out!', description: `You won ${payout}!` });
    });
  }

  return (
    <Card className="max-w-2xl mx-auto bg-secondary border-primary/20">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6">
        <div className="grid grid-cols-5 gap-2 flex-grow">
          {Array.from({ length: GRID_SIZE }).map((_, i) => {
            const isRevealed = revealed.includes(i);
            const isMine = minePositions.has(i);
            return (
              <button
                key={i}
                disabled={gameOver}
                onClick={() => handleTileClick(i)}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center transition-all duration-200",
                  "disabled:cursor-not-allowed",
                  isRevealed
                    ? (isMine ? "bg-red-500/20 border-red-500" : "bg-green-500/20 border-green-500")
                    : "bg-background/50 hover:bg-primary/20 border-primary/20 border"
                )}
              >
                {isRevealed && (isMine ? <Bomb className="w-6 h-6 text-red-500" /> : <Gem className="w-6 h-6 text-green-400" />)}
                 {gameOver && !isRevealed && isMine && <Bomb className="w-6 h-6 text-red-500/50" />}
              </button>
            )
          })}
        </div>
        <div className="w-full md:w-56 flex-shrink-0 space-y-4">
            <div className="p-4 bg-background/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Mines</p>
                <p className="text-2xl font-bold text-primary">{numMines}</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Multiplier</p>
                <p className="text-2xl font-bold text-primary">{currentMultiplier.toFixed(2)}x</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Payout</p>
                <p className="text-2xl font-bold text-green-400 font-mono">{potentialPayout.toLocaleString()}</p>
            </div>
            <Button onClick={handleCashOut} disabled={gameOver || isPending || gemsFound === 0} className="w-full bg-green-600 hover:bg-green-700">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cash Out
            </Button>
            {gameOver && <p className="text-center text-red-500 font-bold mt-2">Game Over</p>}
        </div>
      </CardContent>
    </Card>
  );
}
