'use client';

import { useState, useTransition, useMemo } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2, Bird, Car, Footprints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChickenCrossGameProps {
  bet: Bet;
}

const ROAD_LEVELS = 8;
const LANES_PER_LEVEL = 4;

export default function ChickenCrossGame({ bet }: ChickenCrossGameProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [selections, setSelections] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const carPositions = useMemo(() => {
    // For each level, place one car randomly.
    return Array.from({ length: ROAD_LEVELS }, () => Math.floor(Math.random() * LANES_PER_LEVEL));
  }, []);

  // Medium multiplier progression
  const multiplier = useMemo(() => parseFloat((1 + currentLevel * 0.25).toFixed(2)), [currentLevel]);
  const payout = useMemo(() => Math.floor(bet.amount * multiplier), [bet.amount, multiplier]);

  const handleSelect = (level: number, laneIndex: number) => {
    if (gameOver || level !== currentLevel) return;

    const newSelections = [...selections, laneIndex];
    setSelections(newSelections);

    if (carPositions[level] === laneIndex) {
      setGameOver(true);
      startTransition(async () => {
        await resolveGame(bet.id, 'loss', 0);
        toast({ variant: 'destructive', title: 'SPLAT! You got hit by a car.', description: 'Game Over.' });
      });
    } else {
      if (currentLevel < ROAD_LEVELS - 1) {
        setCurrentLevel(currentLevel + 1);
      } else {
        // Reached the other side, auto cash out
        handleCashOut();
      }
    }
  };

  const handleCashOut = () => {
    if (currentLevel === 0) return;
    setGameOver(true);
    startTransition(async () => {
      await resolveGame(bet.id, 'win', payout);
      toast({ title: 'You made it across!', description: `You won ${payout}!` });
    });
  };

  return (
    <Card className="max-w-md mx-auto bg-secondary border-primary/20">
      <CardContent className="p-6 space-y-4">
        <div className="p-4 bg-background/50 rounded-lg flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Multiplier</p>
            <p className="text-xl font-bold text-primary">{multiplier}x</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payout</p>
            <p className="text-xl font-bold text-green-400 font-mono">{payout.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2 flex flex-col-reverse">
          {Array.from({ length: ROAD_LEVELS }).map((_, level) => (
            <div key={level} className="p-2 bg-background/50 rounded-md">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: LANES_PER_LEVEL }).map((_, laneIndex) => {
                  const isSelected = selections.length > level && selections[level] === laneIndex;
                  const isCar = carPositions[level] === laneIndex;
                  const isClickable = currentLevel === level && !gameOver;

                  return (
                    <button
                      key={laneIndex}
                      disabled={!isClickable}
                      onClick={() => handleSelect(level, laneIndex)}
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center transition-all duration-200 border",
                        isClickable ? "cursor-pointer bg-primary/20 hover:bg-primary/40 border-primary" : "cursor-not-allowed bg-background/30 border-border",
                        isSelected && (isCar ? "bg-red-500/30 border-red-500" : "bg-green-500/30 border-green-500")
                      )}
                    >
                      {isSelected ? (
                        isCar ? <Car className="w-6 h-6 text-red-400" /> : <Footprints className="w-6 h-6 text-green-400" />
                      ) : (
                        isClickable && <Bird className="w-6 h-6 text-primary/70"/>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleCashOut} disabled={gameOver || currentLevel === 0 || isPending} className="w-full bg-green-600 hover:bg-green-700">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cash Out
        </Button>
        {gameOver && <p className="text-center text-lg font-bold text-red-500">Game Over</p>}
      </CardContent>
    </Card>
  );
}
