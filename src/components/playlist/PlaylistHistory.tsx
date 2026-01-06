'use client';

import { usePlaylistStore } from '@/stores';
import { TerminalWindow } from '@/components/terminal';
import { Button } from '@/components/ui';
import { History, Play, Trash2, Calendar } from 'lucide-react';
import { GENRES } from '@/constants/genres';

export function PlaylistHistory() {
  const { playlists, loadPlaylistToQueue, deletePlaylist } = usePlaylistStore();

  const getGenreIcon = (genreId: string): string => {
    const genre = GENRES.find((g) => g.id === genreId);
    return genre?.icon || '🎵';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (playlists.length === 0) {
    return null;
  }

  return (
    <TerminalWindow title="[HISTORY] Recent Playlists" className="h-full">
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        <div className="flex items-center gap-2 text-terminal-muted mb-3">
          <History className="w-4 h-4" />
          <span className="font-mono text-xs">Previously generated playlists</span>
        </div>

        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex items-center gap-2 p-2 border border-terminal-border hover:border-terminal-accent transition-colors group"
          >
            <span className="text-lg shrink-0">{getGenreIcon(playlist.genre)}</span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-terminal-text truncate">
                {playlist.name}
              </div>
              <div className="font-mono text-xs text-terminal-muted flex items-center gap-2">
                <span>{playlist.tracks.length} tracks</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(playlist.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                onClick={() => loadPlaylistToQueue(playlist)}
                title="Load playlist"
              >
                <Play className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => deletePlaylist(playlist.id)}
                title="Delete playlist"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </TerminalWindow>
  );
}
