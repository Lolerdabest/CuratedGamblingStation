'use client';

import type { Bet } from '@/lib/types';
import { ConfirmationForm } from './ConfirmationForm';
import { Suspense } from 'react';

export function ConfirmationProvider({ bet }: { bet: Bet }) {
    // This component provides a client boundary for the confirmation form
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <ConfirmationForm betId={bet.id} />
        </Suspense>
    );
}
