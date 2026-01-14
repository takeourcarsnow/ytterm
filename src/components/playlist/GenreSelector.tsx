'use client';

import { useState, useEffect } from 'react';
import { GENRES, SORT_OPTIONS, TIME_FILTERS } from '@/constants/genres';
import { usePlaylistStore } from '@/stores';
import { Genre, SortOption, TimeFilter } from '@/types';
import { TerminalWindow } from '@/components/terminal';
import { Button, Loading } from '@/components/ui';
import { usePlayerStore } from '@/stores';
import { ChevronDown } from 'lucide-react';

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
  const [showOptions, setShowOptions] = useState(false);

  const { setIsPlaying } = usePlayerStore();

  // Prefetch the first genre once on mount for faster perceived load
  useEffect(() => {
    if (!activePlaylist && !isLoading) {
      const defaultGenre = GENRES[0];
      if (defaultGenre) {
        setSelectedGenre(defaultGenre);
        generatePlaylist(defaultGenre);
        setIsPlaying(true);
      }
    }
  }, [activePlaylist, isLoading, generatePlaylist, setIsPlaying]);

  // Always show all genres instantly
  const visibleGenres = GENRES;

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

        {/* Sort options toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between p-1.5 border border-terminal-border hover:border-terminal-accent font-mono text-[10px]"
        >
          <span className="text-terminal-muted">
            Sort: <span className="text-terminal-text">{sortOption}</span>
            {sortOption === 'top' && <span className="ml-1">({timeFilter})</span>}
          </span>
          <ChevronDown className={`w-3 h-3 text-terminal-muted ${showOptions ? 'rotate-180' : ''}`} />
        </button>

        {/* Options panel */}
        {showOptions && (
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
                    {option.label}
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
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {selectedGenre && (
              <Button
                onClick={() => generatePlaylist(selectedGenre, sortOption, timeFilter)}
                disabled={isLoading}
                variant="primary"
                className="w-full"
              >
                Regenerate
              </Button>
            )}
          </div>
        )}

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

        {/* Genre grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {visibleGenres.map((genre) => (
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
    </TerminalWindow>
  );
}
