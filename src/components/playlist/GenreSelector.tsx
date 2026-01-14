'use client';

import { useState, useEffect } from 'react';
import { GENRES, SORT_OPTIONS, TIME_FILTERS } from '@/constants/genres';
import { usePlaylistStore } from '@/stores';
import { Genre, SortOption, TimeFilter } from '@/types';
import { TerminalWindow } from '@/components/terminal';
import { Button, Loading } from '@/components/ui';
import { usePlayerStore } from '@/stores';
import { Flame, Clock, Trophy, TrendingUp, Sun, Calendar, Infinity } from 'lucide-react';

export function GenreSelector() {
  const {
    generatePlaylist,
    isLoading,
    error,
    sortOption,
    timeFilter,
    setSortOption,
    setTimeFilter,
    activePlaylist,
  } = usePlaylistStore();

  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  const { setIsPlaying } = usePlayerStore();

  const getSortIcon = (sortValue: string) => {
    switch (sortValue) {
      case 'hot':
        return <Flame className="w-3 h-3" />;
      case 'new':
        return <Clock className="w-3 h-3" />;
      case 'top':
        return <Trophy className="w-3 h-3" />;
      case 'rising':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTimeFilterIcon = (timeValue: string) => {
    switch (timeValue) {
      case 'hour':
        return <Clock className="w-3 h-3" />;
      case 'day':
        return <Sun className="w-3 h-3" />;
      case 'week':
      case 'month':
      case 'year':
        return <Calendar className="w-3 h-3" />;
      case 'all':
        return <Infinity className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Previously auto-generated the default genre on mount. Disabled to prevent automatic
  // loading when the page opens — users should select a genre to generate a playlist manually.
  useEffect(() => {
    // no-op: intentionally left blank to avoid auto-loading a genre on mount
  }, []);

  // Always show all genres instantly and group them by category
  const visibleGenres = GENRES;

  const grouped = visibleGenres.reduce((acc, g) => {
    const key = g.category || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {} as Record<string, Genre[]>);

  const categoryOrder = [
    'Electronic',
    'Dance & Club',
    'Hip Hop',
    'Rock',
    'Metal',
    'Jazz',
    'Classical',
    'World',
    'Pop',
    'Discovery',
    'Soundtracks',
    'Live',
    'Production',
    'Era',
    'Niche',
    'Folk',
    'Blues',
    'Reggae & Dub',
    'Other',
  ];

  const orderedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    const aIndex = ai === -1 ? 999 : ai;
    const bIndex = bi === -1 ? 999 : bi;
    return aIndex - bIndex || a.localeCompare(b);
  });

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    // Request generating playlist and start playback when available
    generatePlaylist(genre);
    setIsPlaying(true);
  };

  return (
    <TerminalWindow title="[GENRES]" className="h-full">
      <div className="p-2 space-y-2 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-terminal-accent">
          <span className="sr-only">Select subreddit</span>
        </div>

        {/* Sort options */}
        <div className="border border-terminal-border p-2 space-y-2">
          <div>
            <label className="font-mono text-[10px] text-terminal-muted block mb-1">Sort:</label>
            <div className="flex flex-wrap gap-1">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={sortOption === option.value ? 'primary' : 'default'}
                  onClick={() => setSortOption(option.value as SortOption)}
                >
                  {getSortIcon(option.value)} {option.label}
                </Button>
              ))}
            </div>
          </div>
          {sortOption === 'top' && (
            <div>
              <label className="font-mono text-[10px] text-terminal-muted block mb-1">Time:</label>
              <div className="flex flex-wrap gap-1">
                {TIME_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    size="sm"
                    variant={timeFilter === filter.value ? 'primary' : 'default'}
                    onClick={() => setTimeFilter(filter.value as TimeFilter)}
                  >
                    {getTimeFilterIcon(filter.value)} {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-3">
            <Loading text="Fetching tracks" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-2 border border-red-500 bg-red-500/10 font-mono text-[10px] text-red-400">
            {error}
          </div>
        )}

        {/* Genre groups */}
        <div className="space-y-2">
          {orderedCategories.map((cat) => (
            <div key={cat}>
              <div className="font-mono text-[10px] text-terminal-muted uppercase mb-1">{cat}</div>
              <div className="grid grid-cols-2 gap-1.5 mb-1">
                {grouped[cat].map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre)}
                    disabled={isLoading}
                    className={`p-2 border text-left disabled:opacity-50 ${
                      selectedGenre?.id === genre.id
                        ? 'border-terminal-accent bg-terminal-accent/10'
                        : 'border-terminal-border hover:border-terminal-accent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{genre.icon}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: genre.color }}>
                        {genre.name}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-terminal-muted truncate">
                      r/{genre.subreddit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </TerminalWindow>
  );
}
