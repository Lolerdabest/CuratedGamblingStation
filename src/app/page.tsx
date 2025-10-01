'use client';

import * as React from 'react';
import { GameCard } from '@/components/shared/GameCard';
import { BetModal } from '@/components/auth/BetModal';
import type { Game } from '@/lib/types';
import { games } from '@/lib/data';
import UserSearch from '@/components/play/UserSearch';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <section className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-primary animate-fade-in-down">
            BlockChain
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            The ultimate provably fair gambling experience, powered by your Minecraft server.
          </p>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GameCard
                  game={game}
                  onPlayClick={() => setSelectedGame(game)}
                />
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12 md:my-20 bg-border/40" />

        <section className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold mb-4 text-primary">Check Your Games</h2>
            <p className="text-muted-foreground mb-8">
              Enter your Minecraft username to see your active and past games.
            </p>
            <UserSearch />
        </section>

      </div>
      {selectedGame && (
        <BetModal
          game={selectedGame}
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  );
}
