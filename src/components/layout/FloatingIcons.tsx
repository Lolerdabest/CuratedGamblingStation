'use client';

import {
  CircleDollarSign,
  Gem,
  Club,
  Spade,
  Heart,
  Diamond,
} from 'lucide-react';
import * as React from 'react';

const icons = [
  CircleDollarSign,
  Gem,
  Club,
  Spade,
  Heart,
  Diamond,
];
const NUM_ICONS = 20;

export default function FloatingIcons() {
    const [renderedIcons, setRenderedIcons] = React.useState<React.ReactNode[]>([]);

    React.useEffect(() => {
        const generatedIcons = Array.from({ length: NUM_ICONS }).map((_, i) => {
            const Icon = icons[i % icons.length];
            const size = Math.random() * 80 + 40; // 40px to 120px
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 15; // 15s to 35s
            const delay = Math.random() * -20; // Start at different times

            return (
                <Icon
                    key={i}
                    className="icon"
                    style={{
                        left: `${left}vw`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animationDuration: `${duration}s`,
                        animationDelay: `${delay}s`,
                    }}
                />
            );
        });
        setRenderedIcons(generatedIcons);
    }, []);


  return (
    <div className="floating-icons" aria-hidden="true">
        {renderedIcons}
    </div>
  );
}
