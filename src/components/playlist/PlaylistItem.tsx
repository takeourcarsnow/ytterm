'use client';

import { Track } from '@/types';
import { usePlayerStore, usePlaylistStore } from '@/stores';
import { truncateText, formatTime } from '@/lib/utils';
import { Play, Pause, X, ExternalLink } from 'lucide-react';
import { MiniVisualizer } from '@/components/player/Visualizer';

interface PlaylistItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

export function PlaylistItem({
  track,
  index,
  isActive,
  onPlay,
  onRemove,
}: PlaylistItemProps) {
  const { isPlaying } = usePlayerStore();
  const isCurrentlyPlaying = isActive && isPlaying;

  return (
    <div
      className={`group flex items-center gap-2 p-2 font-mono text-xs border-b border-terminal-border/50 hover:bg-terminal-hover transition-colors ${
        isActive ? 'bg-terminal-accent/10 border-terminal-accent' : ''
      }`}
    >
      {/* Index / Play button */}
      <button
        onClick={onPlay}
        className="w-8 h-8 flex items-center justify-center shrink-0 hover:text-terminal-accent transition-colors"
      >
        {isActive ? (
          isCurrentlyPlaying ? (
            <MiniVisualizer barCount={4} />
          ) : (
            <Pause className="w-4 h-4 text-terminal-accent" />
          )
        ) : (
          <>
            <span className="group-hover:hidden text-terminal-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <Play className="w-4 h-4 hidden group-hover:block" />
          </>
        )}
      </button>

      {/* Track info */}
      <div className="flex-1 min-w-0" onClick={onPlay}>
        <div
          className={`truncate cursor-pointer ${
            isActive ? 'text-terminal-accent' : 'text-terminal-text'
          }`}
          title={track.title}
        >
          {truncateText(track.title, 50)}
        </div>
        {track.artist && (
          <div className="text-terminal-muted truncate text-[10px]">
            {track.artist}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {track.redditUrl && (
          <a
            href={track.redditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:text-terminal-accent transition-colors"
            title="View on Reddit"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 hover:text-red-400 transition-colors"
          title="Remove from queue"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
