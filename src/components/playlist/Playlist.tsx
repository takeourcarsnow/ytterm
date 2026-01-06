'use client';

import { useEffect, useRef } from 'react';
import { usePlaylistStore, usePlayerStore } from '@/stores';
import { TerminalWindow } from '@/components/terminal';
import { PlaylistItem } from './PlaylistItem';
import { Loading } from '@/components/ui';
import { ListMusic, Trash2, RefreshCw } from 'lucide-react';

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

  // Auto-scroll to active track
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [queueIndex]);

  // Auto-set current track when queue changes
  useEffect(() => {
    if (queue.length > 0 && !currentTrack) {
      setCurrentTrack(queue[0]);
    }
  }, [queue, currentTrack, setCurrentTrack]);

  // Update current track when queue index changes
  useEffect(() => {
    if (queue[queueIndex]) {
      setCurrentTrack(queue[queueIndex]);
    }
  }, [queueIndex, queue, setCurrentTrack]);

  const handlePlayTrack = (index: number) => {
    setQueueIndex(index);
    setCurrentTrack(queue[index]);
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrackFromQueue(trackId);
  };

  const handleRefresh = () => {
    if (activePlaylist) {
      refreshPlaylist(activePlaylist.id);
    }
  };

  return (
    <TerminalWindow
      title={
        activePlaylist
          ? `[QUEUE] ${activePlaylist.name} (${queue.length} tracks)${isShuffled ? ' [SHUFFLED]' : ''}`
          : '[QUEUE] No playlist loaded'
      }
      className="h-full flex flex-col"
      headerActions={
        queue.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={isLoading || !activePlaylist}
              className="p-1 hover:bg-terminal-hover text-terminal-muted hover:text-terminal-accent transition-colors disabled:opacity-50"
              title="Refresh playlist"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={clearQueue}
              className="p-1 hover:bg-terminal-hover text-terminal-muted hover:text-red-400 transition-colors"
              title="Clear queue"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )
      }
    >
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loading text="Loading tracks" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center">
            <ListMusic className="w-12 h-12 mx-auto mb-4 text-terminal-muted" />
            <p className="font-mono text-sm text-terminal-muted">
              No tracks in queue
            </p>
            <p className="font-mono text-xs text-terminal-muted mt-2">
              Select a genre to generate a playlist
            </p>
          </div>
        ) : (
          <div>
            {queue.map((track, index) => (
              <div
                key={track.id}
                ref={index === queueIndex ? activeItemRef : undefined}
              >
                <PlaylistItem
                  track={track}
                  index={index}
                  isActive={index === queueIndex}
                  onPlay={() => handlePlayTrack(index)}
                  onRemove={() => handleRemoveTrack(track.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue stats */}
      {queue.length > 0 && (
        <div className="border-t border-terminal-border p-2 font-mono text-xs text-terminal-muted">
          <div className="flex justify-between">
            <span>
              Track {queueIndex + 1} of {queue.length}
            </span>
            {activePlaylist && (
              <span className="text-terminal-accent">
                r/{activePlaylist.subreddit}
              </span>
            )}
          </div>
        </div>
      )}
    </TerminalWindow>
  );
}
