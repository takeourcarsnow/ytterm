'use client';

import { Player, PlayerControls, Visualizer } from '@/components/player';
import { GenreSelector, Playlist, PlaylistHistory } from '@/components/playlist';
import { TerminalHeader } from '@/components/terminal';
import { HelpModal, useHelpModal } from '@/components/ui';
import { KeyboardShortcutsProvider } from '@/hooks';
import { useState } from 'react';
import { Menu, X, List, Radio as RadioIcon, History, HelpCircle } from 'lucide-react';

type MobileTab = 'player' | 'genres' | 'queue' | 'history';

export function MainLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('player');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const helpModal = useHelpModal();

  const tabs: { id: MobileTab; icon: React.ReactNode; label: string }[] = [
    { id: 'player', icon: <RadioIcon className="w-5 h-5" />, label: 'Player' },
    { id: 'genres', icon: <RadioIcon className="w-5 h-5" />, label: 'Genres' },
    { id: 'queue', icon: <List className="w-5 h-5" />, label: 'Queue' },
    { id: 'history', icon: <History className="w-5 h-5" />, label: 'History' },
  ];

  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen bg-terminal-bg flex flex-col">
        <TerminalHeader />

        {/* Desktop Layout */}
        <main className="flex-1 hidden lg:block">
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
              {/* Left column - Genre selector */}
              <div className="col-span-3 flex flex-col gap-4">
                <div className="flex-1 overflow-hidden">
                  <GenreSelector />
                </div>
                <PlaylistHistory />
              </div>

              {/* Center column - Player */}
              <div className="col-span-6 flex flex-col gap-4">
                <div className="flex-1">
                  <Player />
                </div>
                <div className="h-8">
                  <Visualizer barCount={48} className="text-sm" />
                </div>
                <PlayerControls />
              </div>

              {/* Right column - Playlist */}
              <div className="col-span-3">
                <Playlist />
              </div>
            </div>
          </div>
        </main>

        {/* Tablet Layout */}
        <main className="flex-1 hidden md:block lg:hidden">
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-2 gap-4 h-[calc(100vh-140px)]">
              {/* Left column */}
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <Player />
                </div>
                <div className="h-6">
                  <Visualizer barCount={32} className="text-xs" />
                </div>
                <PlayerControls />
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                <div className="flex-1 overflow-hidden">
                  <GenreSelector />
                </div>
                <div className="flex-1 overflow-hidden">
                  <Playlist />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Layout */}
        <main className="flex-1 md:hidden flex flex-col">
          <div className="flex-1 p-3 overflow-hidden">
            {mobileTab === 'player' && (
              <div className="h-full flex flex-col gap-3">
                <div className="flex-1">
                  <Player />
                </div>
                <div className="h-6">
                  <Visualizer barCount={24} className="text-xs" />
                </div>
                <PlayerControls />
              </div>
            )}
            {mobileTab === 'genres' && (
              <div className="h-full">
                <GenreSelector />
              </div>
            )}
            {mobileTab === 'queue' && (
              <div className="h-full">
                <Playlist />
              </div>
            )}
            {mobileTab === 'history' && (
              <div className="h-full">
                <PlaylistHistory />
              </div>
            )}
          </div>

          {/* Mobile Tab Bar */}
          <nav className="border-t border-terminal-border bg-terminal-header">
            <div className="flex items-center justify-around">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id)}
                  className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                    mobileTab === tab.id
                      ? 'text-terminal-accent'
                      : 'text-terminal-muted'
                  }`}
                >
                  {tab.icon}
                  <span className="text-xs font-mono">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </main>

        {/* Footer */}
        <footer className="hidden lg:block border-t border-terminal-border bg-terminal-header py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between font-mono text-xs text-terminal-muted">
              <span>YTTERM v1.0 - Terminal YouTube Player</span>
              <span>Powered by Reddit & YouTube</span>
              <button
                onClick={helpModal.open}
                className="flex items-center gap-1 hover:text-terminal-accent transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                Press <kbd className="px-1 border border-terminal-border">?</kbd> for help
              </button>
            </div>
          </div>
        </footer>

        {/* Help Modal */}
        <HelpModal isOpen={helpModal.isOpen} onClose={helpModal.close} />
      </div>
    </KeyboardShortcutsProvider>
  );
}
