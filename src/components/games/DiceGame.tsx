'use client';

import { useState, useTransition } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiceGameProps {
  bet: Bet;
}

const Dice = ({ value }: { value: number }) => {
    const dots = Array.from({ length: value }, (_, i) => i);
    return (
      <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center shadow-lg border border-primary/20"
           style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(-30deg)' }}>
        <div className={`grid grid-cols-3 gap-1 p-1`}>
            {Array(9).fill(0).map((_, i) => (
                <span key={i} className={`w-4 h-4 rounded-full ${getDotClasses(value, i)}`}/>
            ))}
        </div>
      </div>
    );
};
  
const getDotClasses = (dieValue: number, index: number): string => {
    const dotVisible = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    }[dieValue as 1|2|3|4|5|6] || [];
  
    return dotVisible.includes(index) ? 'bg-primary' : '';
};


export default function DiceGame({ bet }: DiceGameProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ die1: number; die2: number; total: number } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const { toast } = useToast();

  const handleRoll = () => {
    setIsRolling(true);
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setResult({ die1, die2, total: die1 + die2 });
      setIsRolling(false);
      
      startTransition(async () => {
        const didWin = (die1 + die2) > 7;
        const payout = didWin ? bet.amount * 2 : 0;
        const gameResult = await resolveGame(bet.id, didWin ? 'win' : 'loss', payout);
        if (gameResult.success) {
            toast({ title: didWin ? "You won!" : "You lost.", description: `The total was ${die1 + die2}.`});
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save game result.'});
        }
      });
    }, 1500);
  };

  return (
    <Card className="max-w-md mx-auto bg-secondary border-primary/20 text-center">
      <CardContent className="p-6">
        <p className="text-muted-foreground mb-6">Roll over 7 to double your bet!</p>
        <div className="flex justify-center items-center gap-6 mb-8 h-24">
            <Dice value={isRolling ? Math.floor(Math.random() * 6) + 1 : result?.die1 ?? 1} />
            <Dice value={isRolling ? Math.floor(Math.random() * 6) + 1 : result?.die2 ?? 1} />
        </div>
        
        {result && !isRolling && (
          <div className="mb-6 animate-fade-in-up">
            <h2 className="text-4xl font-bold">{result.total}</h2>
            <p className="text-lg font-semibold text-primary">
              {result.total > 7 ? 'Winner!' : 'Better luck next time!'}
            </p>
          </div>
        )}

        <Button onClick={handleRoll} disabled={isRolling || isPending || !!result} className="w-full">
          {(isRolling || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRolling ? 'Rolling...' : result ? 'Game Over' : 'Roll Dice'}
        </Button>
      </CardContent>
    </Card>
  );
}
