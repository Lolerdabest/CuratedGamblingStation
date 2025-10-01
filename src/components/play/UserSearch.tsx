'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function UserSearch() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/play/user/${username.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 sm:flex-row items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter your Minecraft username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit" className="w-full sm:w-auto">
        <Search className="mr-2" />
        View Games
      </Button>
    </form>
  );
}
