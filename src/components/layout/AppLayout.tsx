'use client';

import * as React from 'react';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { games } from '@/lib/data';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="md:hidden">
              <Link href="/">
                <Gamepad2 />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-5 shrink-0" />
              <div className="text-lg font-bold">BlockChain</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {games.map((game) => (
              <SidebarMenuItem key={game.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/game/${game.id}`}
                >
                  <Link href={`/?game=${game.id}`}>
                    <game.icon />
                    <span>{game.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="shrink-0" />
          <div className="flex items-center gap-2">
             {/* Admin button removed */}
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </>
  );
}
