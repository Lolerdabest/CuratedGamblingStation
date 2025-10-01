'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="text-green-500" /> : <Copy />}
        </Button>
    )
}