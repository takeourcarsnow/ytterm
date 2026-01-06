'use client';

import { useState } from 'react';
import { GENRES, SORT_OPTIONS, TIME_FILTERS } from '@/constants/genres';
import { usePlaylistStore } from '@/stores';
import { Genre, SortOption, TimeFilter } from '@/types';
import { TerminalWindow } from '@/components/terminal';
import { Button, Loading } from '@/components/ui';
import { ChevronDown, Radio, Sparkles } from 'lucide-react';

export function GenreSelector() {
  const {
    generatePlaylist,
    isLoading,
    error,
    sortOption,
    timeFilter,
    setSortOption,
    setTimeFilter,
  } = usePlaylistStore();

  const [showAllGenres, setShowAllGenres] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const visibleGenres = showAllGenres ? GENRES : GENRES.slice(0, 8);

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    generatePlaylist(genre);
  };

  const handleGenerateWithOptions = () => {
    if (selectedGenre) {
      generatePlaylist(selectedGenre, sortOption, timeFilter);
    }
  };

  return (
    <TerminalWindow
      title="[SELECT GENRE] - r/subreddit radio"
      className="h-full"
    >
      <div className="p-3 space-y-4 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-terminal-accent">
          <Radio className="w-4 h-4" />
          <span className="font-mono text-sm">
            Generate playlist from subreddit
          </span>
        </div>

        {/* Sort options toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between p-2 border border-terminal-border hover:border-terminal-accent transition-colors font-mono text-xs"
        >
          <span className="text-terminal-muted">
            Sort: <span className="text-terminal-text">{sortOption}</span>
            {sortOption === 'top' && (
              <span className="text-terminal-muted ml-1">({timeFilter})</span>
            )}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-terminal-muted transition-transform ${
              showOptions ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Options panel */}
        {showOptions && (
          <div className="border border-terminal-border p-3 space-y-3">
            {/* Sort options */}
            <div>
              <label className="font-mono text-xs text-terminal-muted block mb-2">
                Sort by:
              </label>
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

            {/* Time filter (only for 'top' sort) */}
            {sortOption === 'top' && (
              <div>
                <label className="font-mono text-xs text-terminal-muted block mb-2">
                  Time range:
                </label>
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

            {/* Apply button */}
            {selectedGenre && (
              <Button
                onClick={handleGenerateWithOptions}
                disabled={isLoading}
                variant="primary"
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate {selectedGenre.name}
              </Button>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="py-4">
            <Loading text="Fetching tracks from Reddit" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-3 border border-red-500 bg-red-500/10 font-mono text-xs text-red-400">
            ERROR: {error}
          </div>
        )}

        {/* Genre grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2">
          {visibleGenres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreSelect(genre)}
              disabled={isLoading}
              className={`p-3 border text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedGenre?.id === genre.id
                  ? 'border-terminal-accent bg-terminal-accent/10'
                  : 'border-terminal-border hover:border-terminal-accent'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{genre.icon}</span>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: genre.color }}
                >
                  {genre.name}
                </span>
              </div>
              <div className="font-mono text-xs text-terminal-muted truncate">
                r/{genre.subreddit}
              </div>
            </button>
          ))}
        </div>

        {/* Show more button */}
        {GENRES.length > 8 && (
          <button
            onClick={() => setShowAllGenres(!showAllGenres)}
            className="w-full py-2 font-mono text-xs text-terminal-muted hover:text-terminal-accent transition-colors"
          >
            {showAllGenres ? '▲ Show less' : `▼ Show all (${GENRES.length} genres)`}
          </button>
        )}

        {/* Info */}
        <div className="border-t border-terminal-border pt-3">
          <p className="font-mono text-xs text-terminal-muted leading-relaxed">
            <span className="text-terminal-accent">TIP:</span> Click a genre to fetch
            YouTube links from that subreddit. The player will automatically start
            playing the first track.
          </p>
        </div>
      </div>
    </TerminalWindow>
  );
}
