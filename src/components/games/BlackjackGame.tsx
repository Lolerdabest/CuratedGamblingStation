'use client';

import { useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { Bet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resolveGame } from '@/lib/actions';
import { Loader2, Spade, Heart, Diamond, Club, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
interface CardType {
  suit: Suit;
  rank: Rank;
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_VALUES: Record<Rank, number> = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 };

const SuitIcon = ({ suit, ...props }: { suit: Suit } & React.ComponentProps<typeof Spade>) => {
  if (suit === 'hearts') return <Heart {...props} />;
  if (suit === 'diamonds') return <Diamond {...props} />;
  if (suit === 'clubs') return <Club {...props} />;
  return <Spade {...props} />;
};

const PlayingCard = ({ card, hidden = false, index = 0 }: { card: CardType | null, hidden?: boolean, index?: number }) => (
  <div
    className={cn(
      "w-20 h-28 bg-card rounded-lg border-2 flex items-center justify-center relative transition-transform duration-300 ease-out",
      hidden ? 'bg-red-800 border-red-950' : 'border-primary/50',
      `animate-deal-in`
    )}
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {!card || hidden ? (
        <Spade className="text-red-400/50 w-8 h-8" />
    ) : (
      <>
        <span className={cn("absolute top-1 left-2 font-bold text-lg", card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-foreground')}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} className={cn("w-8 h-8", card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-foreground')} />
      </>
    )}
     <style jsx>{`
        @keyframes deal-in {
          0% { transform: translateY(20px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-deal-in {
          animation: deal-in 0.3s ease-out forwards;
        }
      `}</style>
  </div>
);

const Hand = ({ title, score, cards, isDealer, showAllDealerCards }: { title: string; score: number; cards: CardType[]; isDealer?: boolean; showAllDealerCards?: boolean }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      {isDealer ? <Bot className="text-muted-foreground" /> : <User className="text-muted-foreground" />}
      <h3 className="font-bold text-lg text-muted-foreground">{title}</h3>
      {score > 0 && <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md text-sm font-bold">{score}</span>}
    </div>
    <div className="flex space-x-2 h-32 items-center">
      {cards.map((card, i) => (
        <PlayingCard key={i} card={card} hidden={isDealer && i === 0 && !showAllDealerCards} index={i} />
      ))}
    </div>
  </div>
);


export default function BlackjackGame({ bet }: { bet: Bet }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [deck, setDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'finished'>('betting');

  const createDeck = () => {
    return SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));
  };

  const shuffleDeck = (deck: CardType[]) => {
    return deck.sort(() => Math.random() - 0.5);
  };
  
  const calculateScore = (hand: CardType[]) => {
    let score = hand.reduce((acc, card) => acc + CARD_VALUES[card.rank], 0);
    let numAces = hand.filter(card => card.rank === 'A').length;
    while (score > 21 && numAces > 0) {
      score -= 10;
      numAces--;
    }
    return score;
  };
  
  const playerScore = useMemo(() => calculateScore(playerHand), [playerHand]);
  const dealerScore = useMemo(() => calculateScore(dealerHand), [dealerHand]);
  
  const dealCard = useCallback((currentDeck: CardType[]): { card: CardType, newDeck: CardType[] } => {
    const card = currentDeck[0];
    const newDeck = currentDeck.slice(1);
    return { card, newDeck };
  }, []);
  
  const startGame = () => {
    let newDeck = shuffleDeck(createDeck());
    
    let player = [];
    let dealer = [];
    
    let dealResult = dealCard(newDeck);
    player.push(dealResult.card);
    newDeck = dealResult.newDeck;
    
    dealResult = dealCard(newDeck);
    dealer.push(dealResult.card);
    newDeck = dealResult.newDeck;

    dealResult = dealCard(newDeck);
    player.push(dealResult.card);
    newDeck = dealResult.newDeck;
    
    dealResult = dealCard(newDeck);
    dealer.push(dealResult.card);
    newDeck = dealResult.newDeck;

    setDeck(newDeck);
    setPlayerHand(player);
    setDealerHand(dealer);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'betting') {
        startGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);


  const finishGame = useCallback((result: 'win' | 'loss' | 'push', payout: number, message: string) => {
    setGameState('finished');
    startTransition(async () => {
        await resolveGame(bet.id, result, payout);
        toast({ title: message, description: `Payout: ${payout}` });
    });
  }, [bet.id, toast]);


  const handleHit = () => {
    if (gameState !== 'playing') return;
    const { card, newDeck } = dealCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (calculateScore(newHand) > 21) {
      finishGame('loss', 0, "Bust! You went over 21.");
    }
  };

  const handleStand = () => {
    if (gameState !== 'playing') return;
    setGameState('dealer');
  };

  useEffect(() => {
    if (gameState === 'dealer') {
      let currentDealerHand = [...dealerHand];
      let currentDeck = [...deck];
      
      while (calculateScore(currentDealerHand) < 17) {
        const { card, newDeck } = dealCard(currentDeck);
        currentDealerHand.push(card);
        currentDeck = newDeck;
      }
      setDealerHand(currentDealerHand);
      setDeck(currentDeck);

      const finalDealerScore = calculateScore(currentDealerHand);
      if (finalDealerScore > 21 || playerScore > finalDealerScore) {
        finishGame('win', bet.amount * 2, "You Win!");
      } else if (playerScore < finalDealerScore) {
        finishGame('loss', 0, "Dealer Wins!");
      } else {
        finishGame('push', bet.amount, "Push! It's a tie.");
      }
    }
  }, [gameState, dealerHand, deck, dealCard, playerScore, bet.amount, finishGame]);

  useEffect(() => {
    if (playerScore === 21 && playerHand.length === 2) {
      finishGame('win', bet.amount * 2.5, "Blackjack! You win!");
    }
  }, [playerScore, playerHand.length, bet.amount, finishGame]);


  return (
    <Card className="max-w-2xl mx-auto bg-secondary border-primary/20">
      <CardContent className="p-6 space-y-6">
        <Hand title="Dealer's Hand" score={gameState === 'finished' || gameState === 'dealer' ? dealerScore : CARD_VALUES[dealerHand[1]?.rank] ?? 0} cards={dealerHand} isDealer showAllDealerCards={gameState === 'dealer' || gameState === 'finished'} />
        
        <div className="h-px bg-border my-4" />

        <Hand title="Your Hand" score={playerScore} cards={playerHand} />

        <div className="flex justify-center gap-4 pt-4">
          <Button 
            onClick={handleHit} 
            disabled={gameState !== 'playing' || isPending}
            className="w-32 bg-green-600 hover:bg-green-700"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hit
          </Button>
          <Button 
            onClick={handleStand} 
            disabled={gameState !== 'playing' || isPending}
            className="w-32 bg-red-600 hover:bg-red-700"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Stand
          </Button>
        </div>
        {gameState === 'finished' && <p className="text-center text-lg font-bold text-primary animate-pulse">Game Over</p>}
      </CardContent>
    </Card>
  );
}
