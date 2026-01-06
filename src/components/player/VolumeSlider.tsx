'use client';

import { useRef, useCallback } from 'react';
import { VOLUME_BARS } from '@/constants/ascii';

interface VolumeSliderProps {
  volume: number;
  onChange: (volume: number) => void;
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateVolume = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onChange(calculateVolume(e.clientX));
  }, [calculateVolume, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const handleMouseMove = (moveEvent: MouseEvent) => {
      onChange(calculateVolume(moveEvent.clientX));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [calculateVolume, onChange]);

  // Generate ASCII volume bars
  const barCount = 8;
  const activeBarIndex = Math.floor((volume / 100) * barCount);

  return (
    <div className="space-y-1">
      {/* Slider track */}
      <div
        ref={containerRef}
        className="relative h-2 cursor-pointer group"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        tabIndex={0}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-terminal-border rounded-sm" />
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-terminal-accent rounded-sm transition-all"
          style={{ width: `${volume}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-3 bg-terminal-accent rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${volume}% - 4px)` }}
        />
      </div>

      {/* ASCII volume bars */}
      <div className="flex justify-between h-4 font-mono text-[10px]">
        {VOLUME_BARS.map((bar, index) => (
          <span
            key={index}
            className={index < activeBarIndex ? 'text-terminal-accent' : 'text-terminal-border'}
          >
            {bar}
          </span>
        ))}
      </div>
    </div>
  );
}
