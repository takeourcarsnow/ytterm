'use client';

import { ThemeToggle } from '@/components/ui';
import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

export function TerminalHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex-shrink-0 border-b border-terminal-border bg-terminal-header px-3 py-1.5">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-terminal-accent" />
          <h1 className="font-mono text-sm text-terminal-accent font-bold">
            ReddiTunes
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-terminal-muted hidden sm:block">{time}</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
