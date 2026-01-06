'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { VISUALIZER_CHARS } from '@/constants/ascii';
import { usePlayerStore } from '@/stores';

interface VisualizerProps {
  barCount?: number;
  className?: string;
}

export function Visualizer({ barCount = 32, className = '' }: VisualizerProps) {
  const { isPlaying } = usePlayerStore();
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(0));
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    // Throttle updates to ~30fps
    if (timestamp - lastUpdateRef.current < 33) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastUpdateRef.current = timestamp;

    if (isPlaying) {
      setBars((prev) =>
        prev.map((bar, index) => {
          // Create wave-like movement with some randomness
          const wave = Math.sin(timestamp / 200 + index * 0.3) * 0.5 + 0.5;
          const random = Math.random() * 0.3;
          const target = wave + random;
          // Smooth transition
          return bar + (target - bar) * 0.3;
        })
      );
    } else {
      // Decay when paused
      setBars((prev) =>
        prev.map((bar) => Math.max(0, bar - 0.05))
      );
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const getBarChar = (value: number): string => {
    const index = Math.min(
      Math.floor(value * VISUALIZER_CHARS.length),
      VISUALIZER_CHARS.length - 1
    );
    return VISUALIZER_CHARS[Math.max(0, index)];
  };

  return (
    <div className={`font-mono flex items-end justify-center gap-px ${className}`}>
      {bars.map((bar, index) => (
        <span
          key={index}
          className="text-terminal-accent transition-all duration-75"
          style={{
            opacity: isPlaying ? 0.4 + bar * 0.6 : 0.2,
          }}
        >
          {getBarChar(bar)}
        </span>
      ))}
    </div>
  );
}

export function MiniVisualizer({ barCount = 8 }: { barCount?: number }) {
  const { isPlaying } = usePlayerStore();
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(0));

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array(barCount).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array(barCount)
          .fill(0)
          .map(() => Math.random())
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  const getBarChar = (value: number): string => {
    const index = Math.floor(value * VISUALIZER_CHARS.length);
    return VISUALIZER_CHARS[Math.min(index, VISUALIZER_CHARS.length - 1)];
  };

  return (
    <span className="font-mono text-terminal-accent">
      {bars.map((bar, i) => (
        <span key={i} style={{ opacity: isPlaying ? 0.5 + bar * 0.5 : 0.3 }}>
          {getBarChar(bar)}
        </span>
      ))}
    </span>
  );
}
