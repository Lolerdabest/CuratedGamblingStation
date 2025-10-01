import UserSearch from "@/components/play/UserSearch";

export default function PlayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-headline font-bold mb-4 text-primary">Find Your Games</h1>
        <p className="text-muted-foreground mb-8">
          Enter your Minecraft username to see your active games and bet history.
        </p>
        <UserSearch />
      </div>
    </div>
  );
}
