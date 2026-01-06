'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { TerminalWindow } from '@/components/terminal';
import { Button } from '@/components/ui';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'Space', description: 'Play / Pause' },
  { key: '←', description: 'Seek back 10s' },
  { key: '→', description: 'Seek forward 10s' },
  { key: 'Shift + ←', description: 'Previous track' },
  { key: 'Shift + →', description: 'Next track' },
  { key: '↑', description: 'Volume up' },
  { key: '↓', description: 'Volume down' },
  { key: 'M', description: 'Toggle mute' },
  { key: 'R', description: 'Cycle repeat mode' },
  { key: 'S', description: 'Toggle shuffle' },
  { key: 'N', description: 'Next track' },
  { key: 'P', description: 'Previous track' },
  { key: '?', description: 'Show this help' },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <TerminalWindow
          title="[HELP] Keyboard Shortcuts"
          headerActions={
            <button
              onClick={onClose}
              className="p-1 hover:bg-terminal-hover text-terminal-muted hover:text-terminal-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-terminal-accent mb-4">
              <Keyboard className="w-5 h-5" />
              <span className="font-mono text-sm">Keyboard Controls</span>
            </div>

            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-1 border-b border-terminal-border/50"
                >
                  <kbd className="px-2 py-1 bg-terminal-bg-secondary border border-terminal-border font-mono text-xs text-terminal-accent">
                    {shortcut.key}
                  </kbd>
                  <span className="font-mono text-xs text-terminal-text">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-terminal-border">
              <h3 className="font-mono text-sm text-terminal-accent mb-2">About YTTERM</h3>
              <p className="font-mono text-xs text-terminal-muted leading-relaxed">
                YTTERM is a terminal-inspired YouTube player that generates playlists
                from music subreddits. Select a genre to fetch YouTube links from
                the corresponding subreddit and start listening.
              </p>
            </div>

            <div className="mt-4">
              <Button onClick={onClose} variant="primary" className="w-full">
                Got it!
              </Button>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}

export function useHelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        // Ignore if typing in input
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
