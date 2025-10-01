import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Game } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onPlayClick: () => void;
  className?: string;
}

export function GameCard({ game, onPlayClick, className }: GameCardProps) {
  const Icon = game.icon;

  return (
    <Card className={cn("flex flex-col h-full bg-card border-border hover:border-primary/60 transition-all duration-300 group overflow-hidden", className)}>
      <CardHeader className="p-0">
        <div className="relative w-full h-40 rounded-t-lg overflow-hidden">
            <div className="w-full h-full bg-secondary flex items-center justify-center">
                <Icon className="w-20 h-20 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
            </div>
           <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
         <h3 className="font-bold text-lg text-foreground">{game.name}</h3>
         <p className="text-sm text-muted-foreground">{game.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={onPlayClick} className="w-full font-bold">
          Play Now
        </Button>
      </CardFooter>
    </Card>
  );
}
