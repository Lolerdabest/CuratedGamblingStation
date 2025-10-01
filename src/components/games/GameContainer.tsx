'use client';

import { Bet } from "@/lib/types";
import MinesGame from "./MinesGame";
import RouletteGame from "./RouletteGame";
import PopTheBalloonGame from "./PopTheBalloonGame";
import BlackjackGame from "./BlackjackGame";
import KenoGame from "./KenoGame";
import DragonTowerGame from "./DragonTowerGame";
import ChickenCrossGame from "./ChickenCrossGame";
import { games } from "@/lib/data";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameContainerProps {
    bet: Bet;
}

const gameComponents = {
    'mines': MinesGame,
    'roulette': RouletteGame,
    'pop-the-balloon': PopTheBalloonGame,
    'blackjack': BlackjackGame,
    'keno': KenoGame,
    'dragon-tower': DragonTowerGame,
    'chicken-cross': ChickenCrossGame,
};

export default function GameContainer({ bet }: GameContainerProps) {
    const GameComponent = gameComponents[bet.gameId];
    const gameInfo = games.find(g => g.id === bet.gameId);
    const GameIcon = gameInfo?.icon;

    if (bet.status === 'won' || bet.status === 'lost') {
        const won = bet.status === 'won';
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className={cn(
                    "max-w-md w-full text-center bg-secondary/80 backdrop-blur-sm border-2 animate-scale-in",
                    won ? "border-green-500/50" : "border-red-500/50"
                )} style={{ animation: 'scale-in 0.3s ease-out forwards' }}>
                    <CardHeader className="pb-2">
                         {won ? (
                            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center bg-green-500/10 shadow-[0_0_20px_theme(colors.green.500/0.4)]">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                        ) : (
                             <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center bg-red-500/10 shadow-[0_0_20px_theme(colors.red.500/0.4)]">
                                <XCircle className="h-12 w-12 text-red-500" />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <h2 className={cn(
                            "text-3xl font-headline font-bold",
                             won ? "text-green-400" : "text-red-500"
                        )}>
                            {won ? "You Won!" : "You Lost"}
                        </h2>
                        
                        <p className="text-muted-foreground">
                            You bet <span className="font-mono text-primary">{bet.amount.toLocaleString()}</span> on {bet.gameName}.
                        </p>

                        {won && bet.payout && (
                             <div className="py-4">
                                <p className="text-sm text-muted-foreground">Payout</p>
                                <p className="text-4xl font-bold font-mono text-green-400">
                                    {bet.payout.toLocaleString()}
                                </p>
                             </div>
                        )}

                        <p className="text-sm text-center pt-2">
                             {won
                                ? "Your payout will be processed shortly!"
                                : "Better luck next time!"
                            }
                        </p>
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
