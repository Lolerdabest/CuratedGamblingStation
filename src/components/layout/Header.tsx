'use client';

import Link from 'next/link';
import { Gamepad2, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">BlockChain</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
           <Link
              href="/"
              className={cn(
                'transition-colors hover:text-primary',
                pathname === "/" ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Home
            </Link>
        </nav>
      </div>
    </header>
  );
}
