'use client';

import { useEffect, useCallback } from 'react';
import { usePlayerStore, usePlaylistStore } from '@/stores';

export function useKeyboardShortcuts() {
  const { cycleRepeatMode } = usePlayerStore();
  const { nextTrack, previousTrack, toggleShuffle } = usePlaylistStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'arrowright':
          if (event.shiftKey) {
            event.preventDefault();
            nextTrack();
          }
          break;
        case 'arrowleft':
          if (event.shiftKey) {
            event.preventDefault();
            previousTrack();
          }
          break;
        case 'r':
          event.preventDefault();
          cycleRepeatMode();
          break;
        case 's':
          event.preventDefault();
          toggleShuffle();
          break;
        case 'n':
          event.preventDefault();
          nextTrack();
          break;
        case 'p':
          event.preventDefault();
          previousTrack();
          break;
      }
    },
    [cycleRepeatMode, nextTrack, previousTrack, toggleShuffle]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
