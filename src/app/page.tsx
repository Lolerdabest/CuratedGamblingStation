
import * as React from 'react';
import { GameCard } from '@/components/shared/GameCard';
import { BetModal } from '@/components/auth/BetModal';
import { games } from '@/lib/data';
import { GameCodeForm } from '@/components/play/GameCodeForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const gameId = searchParams.game as string | undefined;

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-center text-4xl md:text-5xl font-headline font-bold text-primary mb-12 animate-fade-in-down" style={{ textShadow: '0 0 15px hsl(var(--primary))' }}>
          Curated Gambling
        </h1>

        <section className="mb-12 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/?game=${game.id}`} scroll={false}>
                    <GameCard
                        game={game}
                    />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Card className="max-w-xl mx-auto bg-card">
            <CardHeader>
              <CardTitle className="text-center font-headline text-2xl">Have a Game Code?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                Enter the code provided by an admin to access your game.
              </p>
              <GameCodeForm />
            </CardContent>
          </Card>
        </section>

      </div>
      {gameId && (
        <BetModal
          gameId={gameId}
        />
      )}
    </>
  );
}
