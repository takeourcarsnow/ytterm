'use client';

import { Player, PlayerControls } from '@/components/player';
import { GenreSelector, Playlist, PlaylistHistory } from '@/components/playlist';
import { TerminalHeader } from '@/components/terminal';
import { HelpModal, useHelpModal } from '@/components/ui';
import { KeyboardShortcutsProvider } from '@/hooks';
import { useState } from 'react';
import { List, Radio as RadioIcon, History, HelpCircle } from 'lucide-react';

type MobileTab = 'player' | 'genres' | 'queue' | 'history';

export function MainLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('player');
  const helpModal = useHelpModal();

  const tabs: { id: MobileTab; icon: React.ReactNode; label: string }[] = [
    { id: 'player', icon: <RadioIcon className="w-4 h-4" />, label: 'Player' },
    { id: 'genres', icon: <RadioIcon className="w-4 h-4" />, label: 'Genres' },
    { id: 'queue', icon: <List className="w-4 h-4" />, label: 'Queue' },
    { id: 'history', icon: <History className="w-4 h-4" />, label: 'History' },
  ];

  return (
    <KeyboardShortcutsProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-terminal-bg">
        <TerminalHeader />

        {/* Desktop Layout (lg+) */}
        <main className="hidden lg:grid flex-1 min-h-0 grid-cols-[280px_1fr_280px]">
          {/* Left sidebar */}
          <div className="border-r border-terminal-border flex flex-col min-h-0">
            <div className="flex-1 p-3 overflow-auto">
              <GenreSelector />
            </div>
            <div className="border-t border-terminal-border p-3 h-48 overflow-auto">
              <PlaylistHistory />
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col min-h-0 p-3 gap-3">
            <div className="flex-1 min-h-0">
              <Player />
            </div>
            <PlayerControls />
          </div>

          {/* Right sidebar */}
          <div className="border-l border-terminal-border p-3 overflow-auto">
            <Playlist />
          </div>
        </main>

        {/* Tablet Layout (md to lg) */}
        <main className="hidden md:grid lg:hidden flex-1 min-h-0 grid-cols-[1fr_280px]">
          {/* Left - Player */}
          <div className="flex flex-col min-h-0 p-3 gap-3">
            <div className="flex-1 min-h-0">
              <Player />
            </div>
            <PlayerControls />
          </div>

          {/* Right - Genres and Playlist */}
          <div className="border-l border-terminal-border flex flex-col min-h-0">
            <div className="flex-1 p-3 overflow-auto">
              <GenreSelector />
            </div>
            <div className="flex-1 border-t border-terminal-border p-3 overflow-auto">
              <Playlist />
            </div>
          </div>
        </main>

        {/* Mobile Layout */}
        <main className="flex-1 md:hidden flex flex-col min-h-0">
          <div className="flex-1 p-3 overflow-auto min-h-0">
            {mobileTab === 'player' && (
              <div className="flex flex-col gap-3 h-full">
                <div className="flex-1 min-h-0">
                  <Player />
                </div>
                <PlayerControls />
              </div>
            )}
            {mobileTab === 'genres' && <GenreSelector />}
            {mobileTab === 'queue' && <Playlist />}
            {mobileTab === 'history' && <PlaylistHistory />}
          </div>

          {/* Mobile Tab Bar */}
          <nav className="flex-shrink-0 border-t border-terminal-border bg-terminal-header">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id)}
                  className={`flex-1 py-2 flex flex-col items-center gap-0.5 ${
                    mobileTab === tab.id
                      ? 'text-terminal-accent'
                      : 'text-terminal-muted'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] font-mono">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-terminal-border bg-terminal-header py-1.5 px-3">
          <div className="flex items-center justify-between font-mono text-xs text-terminal-muted">
            <span className="hidden sm:inline">ReddiTunes v1.0</span>
            <span className="sm:hidden">ReddiTunes</span>
            <button
              onClick={helpModal.open}
              className="flex items-center gap-1 hover:text-terminal-accent"
            >
              <HelpCircle className="w-3 h-3" />
              <kbd className="px-1 border border-terminal-border text-[10px]">?</kbd>
            </button>
          </div>
        </footer>

        <HelpModal isOpen={helpModal.isOpen} onClose={helpModal.close} />
      </div>
    </KeyboardShortcutsProvider>
  );
}
