'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlaylistStore, usePlayerStore } from '@/stores';
import { TerminalWindow } from '@/components/terminal';
import { PlaylistItem } from './PlaylistItem';
import { Loading } from '@/components/ui';
import { ListMusic, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export function Playlist() {
  const {
    queue,
    queueIndex,
    activePlaylist,
    isLoading,
    setQueueIndex,
    removeTrackFromQueue,
    clearQueue,
    refreshPlaylist,
    isShuffled,
  } = usePlaylistStore();

  const { setCurrentTrack, currentTrack } = usePlayerStore();
  const activeItemRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const TRACKS_PER_PAGE = 5;
  const totalPages = Math.ceil(queue.length / TRACKS_PER_PAGE);
  const startIndex = currentPage * TRACKS_PER_PAGE;
  const visibleTracks = queue.slice(startIndex, startIndex + TRACKS_PER_PAGE);

  // Auto-switch page when track changes
  useEffect(() => {
    if (queueIndex >= 0 && queue.length > 0) {
      const trackPage = Math.floor(queueIndex / TRACKS_PER_PAGE);
      if (trackPage !== currentPage) setCurrentPage(trackPage);
    }
  }, [queueIndex, queue.length, currentPage]);

  // Sync current track with queue index - single source of truth
  useEffect(() => {
    const track = queue[queueIndex];
    if (track && track.id !== currentTrack?.id) {
      setCurrentTrack(track);
    }
  }, [queueIndex, queue, currentTrack?.id, setCurrentTrack]);

  // Reset page when queue changes completely
  useEffect(() => {
    setCurrentPage(0);
  }, [activePlaylist?.id]);

  const handlePlayTrack = (index: number) => {
    // Only set queue index - the effect will handle setting current track
    setQueueIndex(index);
  };

  return (
    <TerminalWindow
      title={`[QUEUE] ${queue.length} tracks${isShuffled ? ' [S]' : ''}`}
      className="h-full flex flex-col"
      headerActions={
        queue.length > 0 && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => activePlaylist && refreshPlaylist(activePlaylist.id)}
              disabled={isLoading || !activePlaylist}
              className="p-0.5 text-terminal-muted hover:text-terminal-accent disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={clearQueue}
              className="p-0.5 text-terminal-muted hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )
      }
    >
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loading text="Loading" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-4 text-center">
            <ListMusic className="w-8 h-8 mx-auto mb-2 text-terminal-muted" />
            <p className="font-mono text-xs text-terminal-muted">No tracks</p>
          </div>
        ) : (
          <div>
            {visibleTracks.map((track, index) => {
              const globalIndex = startIndex + index;
              return (
                <div key={track.id} ref={globalIndex === queueIndex ? activeItemRef : undefined}>
                  <PlaylistItem
                    track={track}
                    index={globalIndex}
                    isActive={globalIndex === queueIndex}
                    onPlay={() => handlePlayTrack(globalIndex)}
                    onRemove={() => removeTrackFromQueue(track.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-terminal-border p-1.5 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-0.5 text-terminal-muted hover:text-terminal-accent disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-[10px] text-terminal-muted">
            {currentPage + 1}/{totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-0.5 text-terminal-muted hover:text-terminal-accent disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </TerminalWindow>
  );
}
