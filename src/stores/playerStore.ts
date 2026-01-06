'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@/types';
import { playerManager } from '@/lib/playerManager';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isLoading: boolean;
  isMuted: boolean;
  repeatMode: 'off' | 'one' | 'all';
  
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  cycleRepeatMode: () => void;
  seekTo: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 80,
      progress: 0,
      duration: 0,
      isLoading: false,
      isMuted: false,
      repeatMode: 'off',

      setCurrentTrack: (track) => set({ currentTrack: track, progress: 0, isLoading: true }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => {
        set({ volume });
        playerManager.setVolume(volume);
      },
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsMuted: (muted) => {
        set({ isMuted: muted });
        if (muted) playerManager.mute();
        else playerManager.unMute();
      },
      setRepeatMode: (mode) => set({ repeatMode: mode }),

      play: () => {
        playerManager.play();
        set({ isPlaying: true });
      },

      pause: () => {
        playerManager.pause();
        set({ isPlaying: false });
      },

      togglePlay: () => {
        const { isPlaying } = get();
        if (isPlaying) {
          get().pause();
        } else {
          get().play();
        }
      },

      toggleMute: () => {
        const { isMuted, setIsMuted } = get();
        setIsMuted(!isMuted);
      },

      cycleRepeatMode: () => {
        const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
        const currentIndex = modes.indexOf(get().repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        set({ repeatMode: modes[nextIndex] });
      },

      seekTo: (seconds) => {
        playerManager.seekTo(seconds);
        set({ progress: seconds });
      },
    }),
    {
      name: 'ytterm-player',
      partialize: (state) => ({
        volume: state.volume,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
