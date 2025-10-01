import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Game } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  imageUrl: string;
  onPlayClick: () => void;
  className?: string;
}

export function GameCard({ game, imageUrl, onPlayClick, className }: GameCardProps) {
  const Icon = game.icon;

  return (
    <Card className={cn("flex flex-col h-full bg-secondary border-primary/20 hover:border-primary/60 transition-all duration-300 group overflow-hidden", className)}>
      <CardHeader>
        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="neon game"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent" />
        </div>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Icon className="w-6 h-6 text-primary" />
          {game.name}
        </CardTitle>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
      </CardContent>
      <CardFooter>
        <Button onClick={onPlayClick} className="w-full font-bold bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 transform group-hover:scale-105">
          Play Now
        </Button>
      </CardFooter>
    </Card>
  );
}
