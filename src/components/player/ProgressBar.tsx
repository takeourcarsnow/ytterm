'use client';

import { useRef, useState, useCallback } from 'react';
import { PROGRESS_CHARS } from '@/constants/ascii';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export function ProgressBar({ progress, duration, onSeek }: ProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const calculatePosition = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return percent;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const percent = calculatePosition(e.clientX);
    const seconds = (percent / 100) * duration;
    onSeek(seconds);
  }, [calculatePosition, duration, onSeek]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const percent = calculatePosition(e.clientX);
    const seconds = (percent / 100) * duration;
    onSeek(seconds);
  }, [calculatePosition, duration, onSeek]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const percent = calculatePosition(e.clientX);
    setHoverPosition(percent);
    
    if (isDragging) {
      const seconds = (percent / 100) * duration;
      onSeek(seconds);
    }
  }, [calculatePosition, duration, isDragging, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-4 cursor-pointer group"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={progress}
      tabIndex={0}
    >
      {/* Background track */}
      <div className="absolute inset-y-1 inset-x-0 bg-terminal-border rounded-sm overflow-hidden">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-terminal-accent transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Hover preview */}
        {hoverPosition !== null && (
          <div
            className="absolute inset-y-0 left-0 bg-terminal-accent/30"
            style={{ width: `${hoverPosition}%` }}
          />
        )}
      </div>

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-terminal-accent rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `calc(${progressPercent}% - 6px)` }}
      />

      {/* ASCII representation (shown on larger screens) */}
      <div className="hidden md:block absolute -bottom-4 left-0 right-0 font-mono text-[8px] text-terminal-muted overflow-hidden">
        <span className="text-terminal-accent">
          {PROGRESS_CHARS.filled.repeat(Math.floor(progressPercent / 5))}
        </span>
        <span>
          {PROGRESS_CHARS.empty.repeat(20 - Math.floor(progressPercent / 5))}
        </span>
      </div>
    </div>
  );
}
