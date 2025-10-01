'use client';

import { Bet } from "@/lib/types";
import MinesGame from "./MinesGame";
import RouletteGame from "./RouletteGame";
import DragonTowerGame from "./DragonTowerGame";
import { games } from "@/lib/data";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp } from "lucide-react";

interface GameContainerProps {
    bet: Bet;
}

const gameComponents = {
    'mines': MinesGame,
    'roulette': RouletteGame,
    'dragon-tower': DragonTowerGame,
};

export default function GameContainer({ bet }: GameContainerProps) {
    const GameComponent = gameComponents[bet.gameId];
    const gameInfo = games.find(g => g.id === bet.gameId);
    const GameIcon = gameInfo?.icon;

    if (bet.status === 'won' || bet.status === 'lost') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md text-center bg-secondary border-primary/20 animate-fade-in-up">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">
                           {bet.status === 'won' ? <span className="text-green-400">You Won!</span> : <span className="text-red-500">You Lost</span>}
                        </CardTitle>
                        <CardDescription>Result of your {bet.gameName} game.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {bet.status === 'won' ? (
                            <ThumbsUp className="mx-auto h-16 w-16 text-green-400" />
                        ) : (
                            <ThumbsDown className="mx-auto h-16 w-16 text-red-500" />
                        )}
                        <p className="text-lg">
                            You bet <span className="font-mono text-primary">{bet.amount}</span> and {bet.status === 'won' ? `won` : `lost`}.
                        </p>
                        {bet.status === 'won' && bet.payout && (
                             <p className="text-2xl font-bold">
                                Payout: <span className="font-mono text-green-400">{bet.payout.toLocaleString()}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!GameComponent || !gameInfo) {
        return <div>Error: Game not found.</div>;
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                   {GameIcon && <GameIcon className="w-10 h-10" />}
                   {bet.gameName}
                </h1>
                <p className="text-muted-foreground">Bet Amount: <span className="font-mono text-primary">{bet.amount}</span></p>
            </div>
            <GameComponent bet={bet} />
        </div>
    );
}
