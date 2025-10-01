import { GameCodeForm } from "@/components/play/GameCodeForm";

export default function PlayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-headline font-bold mb-4 text-primary">Enter Your Game Code</h1>
        <p className="text-muted-foreground mb-8">
          Enter the game code you received from an admin to access your game.
        </p>
        <GameCodeForm />
      </div>
    </div>
  );
}
