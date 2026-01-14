'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, Playlist, Genre, SortOption, TimeFilter } from '@/types';
import { fetchPlaylistFromSubreddit } from '@/lib/reddit';
import { generateId, shuffleArray } from '@/lib/utils';
import { playerManager } from '@/lib/playerManager';

interface PlaylistState {
  // Playlists
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  
  // Queue
  queue: Track[];
  originalQueue: Track[];
  queueIndex: number;
  
  // Loading/Error states
  isLoading: boolean;
  error: string | null;
  
  // Settings
  sortOption: SortOption;
  timeFilter: TimeFilter;
  isShuffled: boolean;
  
  // Actions
  setActivePlaylist: (playlist: Playlist | null) => void;
  generatePlaylist: (genre: Genre, sort?: SortOption, time?: TimeFilter) => Promise<void>;
  addTrackToQueue: (track: Track) => void;
  removeTrackFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueueIndex: (index: number) => void;
  nextTrack: () => Track | null;
  previousTrack: () => Track | null;
  getCurrentTrack: () => Track | null;
  setSortOption: (option: SortOption) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  toggleShuffle: () => void;
  loadPlaylistToQueue: (playlist: Playlist) => void;
  deletePlaylist: (playlistId: string) => void;
  refreshPlaylist: (playlistId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      activePlaylist: null,
      queue: [],
      originalQueue: [],
      queueIndex: 0,
      isLoading: false,
      error: null,
      sortOption: 'hot',
      timeFilter: 'week',
      isShuffled: false,

      setActivePlaylist: (playlist) => set({ activePlaylist: playlist }),

      generatePlaylist: async (genre, sort, time) => {
        const sortOption = sort || get().sortOption;
        const timeFilter = time || get().timeFilter;
        
        set({ isLoading: true, error: null });
        
        try {
          const tracks = await fetchPlaylistFromSubreddit(
            genre.subreddit,
            sortOption,
            timeFilter,
            50
          );
          
          if (tracks.length === 0) {
            throw new Error(`No YouTube tracks found in r/${genre.subreddit}`);
          }
          
          const newPlaylist: Playlist = {
            id: generateId(),
            name: `${genre.name} - ${sortOption}`,
            genre: genre.id,
            subreddit: genre.subreddit,
            tracks,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
          };
          
          set((state) => ({
            playlists: [newPlaylist, ...state.playlists.slice(0, 9)], // Keep last 10 playlists
            activePlaylist: newPlaylist,
            queue: tracks,
            originalQueue: tracks,
            queueIndex: 0,
            isLoading: false,
          }));

          // Stop any existing playback immediately to avoid overlapping audio
          try {
            playerManager.stop();
          } catch (e) {
            /* ignore */
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to generate playlist',
          });
        }
      },

      addTrackToQueue: (track) =>
        set((state) => ({
          queue: [...state.queue, track],
          originalQueue: [...state.originalQueue, track],
        })),

      removeTrackFromQueue: (trackId) =>
        set((state) => {
          const newQueue = state.queue.filter((t) => t.id !== trackId);
          const newOriginalQueue = state.originalQueue.filter((t) => t.id !== trackId);
          let newIndex = state.queueIndex;
          
          const removedIndex = state.queue.findIndex((t) => t.id === trackId);
          if (removedIndex < state.queueIndex) {
            newIndex = Math.max(0, state.queueIndex - 1);
          } else if (removedIndex === state.queueIndex && newIndex >= newQueue.length) {
            newIndex = Math.max(0, newQueue.length - 1);
          }
          
          return {
            queue: newQueue,
            originalQueue: newOriginalQueue,
            queueIndex: newIndex,
          };
        }),

      clearQueue: () =>
        set({
          queue: [],
          originalQueue: [],
          queueIndex: 0,
        }),

      setQueueIndex: (index) => set({ queueIndex: index }),

      nextTrack: () => {
        const state = get();
        if (state.queue.length === 0) return null;
        
        const newIndex = (state.queueIndex + 1) % state.queue.length;
        set({ queueIndex: newIndex });
        return state.queue[newIndex];
      },

      previousTrack: () => {
        const state = get();
        if (state.queue.length === 0) return null;
        
        const newIndex = state.queueIndex === 0 ? state.queue.length - 1 : state.queueIndex - 1;
        set({ queueIndex: newIndex });
        return state.queue[newIndex];
      },

      getCurrentTrack: () => {
        const state = get();
        return state.queue[state.queueIndex] || null;
      },

      setSortOption: (option) => set({ sortOption: option }),

      setTimeFilter: (filter) => set({ timeFilter: filter }),

      toggleShuffle: () =>
        set((state) => {
          if (state.isShuffled) {
            // Restore original order
            const currentTrack = state.queue[state.queueIndex];
            const newIndex = state.originalQueue.findIndex(
              (t) => t.id === currentTrack?.id
            );
            return {
              isShuffled: false,
              queue: state.originalQueue,
              queueIndex: newIndex >= 0 ? newIndex : 0,
            };
          } else {
            // Shuffle queue
            const currentTrack = state.queue[state.queueIndex];
            const shuffled = shuffleArray(state.queue);
            const newIndex = shuffled.findIndex((t) => t.id === currentTrack?.id);
            
            // Move current track to front if found
            if (newIndex > 0) {
              [shuffled[0], shuffled[newIndex]] = [shuffled[newIndex], shuffled[0]];
            }
            
            return {
              isShuffled: true,
              queue: shuffled,
              queueIndex: 0,
            };
          }
        }),

      loadPlaylistToQueue: (playlist) => {
        // Stop any existing playback immediately when loading new playlist
        try {
          playerManager.stop();
        } catch (e) {
          /* ignore */
        }
        set({
          activePlaylist: playlist,
          queue: playlist.tracks,
          originalQueue: playlist.tracks,
          queueIndex: 0,
          isShuffled: false,
        });
      },

      deletePlaylist: (playlistId) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId),
          activePlaylist:
            state.activePlaylist?.id === playlistId ? null : state.activePlaylist,
        })),

      refreshPlaylist: async (playlistId) => {
        const state = get();
        const playlist = state.playlists.find((p) => p.id === playlistId);
        if (!playlist) return;
        
        const genre = {
          id: playlist.genre,
          subreddit: playlist.subreddit,
          name: playlist.name.split(' - ')[0],
        };
        
        await get().generatePlaylist(
          genre as any,
          state.sortOption,
          state.timeFilter
        );
      },
    }),
    {
      name: 'reddituunes-playlists',
      partialize: (state) => ({
        playlists: state.playlists,
        sortOption: state.sortOption,
        timeFilter: state.timeFilter,
      }),
    }
  )
);
