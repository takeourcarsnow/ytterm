'use client';

import React from 'react';
import { useCallback, useRef, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { usePlayerStore, usePlaylistStore } from '@/stores';
import { YOUTUBE_PLAYER_OPTIONS, PLAYER_STATES, YOUTUBE_ERROR_CODES } from '@/lib/youtube';
import { TerminalWindow } from '@/components/terminal';
import { Loading } from '@/components/ui';

function PlayerComponent({ compact = false }: { compact?: boolean }) {
  const { currentTrack, isLoading, setIsLoading, repeatMode, isPlaying, setIsPlaying } = usePlayerStore();
  const { nextTrack } = usePlaylistStore();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);

  // Track component lifecycle
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log('[Player] Error destroying player:', e);
        }
        playerRef.current = null;
      }
      currentTrackIdRef.current = null;
    };
  }, [currentTrack?.id]);
  const onReady = useCallback((event: YouTubeEvent) => {
    // Only set up the player if it matches the current track
    if (currentTrack?.id === currentTrackIdRef.current) {
      return;
    }
    playerRef.current = event.target;
    currentTrackIdRef.current = currentTrack?.id || null;

    // If user requested playback, try to play immediately
    try {
      if (playerRef.current && isPlaying) {
        // playVideo may be blocked on some mobile browsers, but this is a best-effort
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.warn('[Player] play onReady failed', e);
    }
  }, [currentTrack?.id, isPlaying]);

  // When track changes or user requested play, attempt to start playback
  useEffect(() => {
    if (!currentTrack) return;
    if (playerRef.current && isPlaying) {
      try {
        playerRef.current.playVideo();
      } catch (e) {
        console.warn('[Player] play on currentTrack change failed', e);
      }
    }
  }, [currentTrack?.id, isPlaying]);

  // Keep trying to resume playback while the page is backgrounded (some emulators/browsers pause audio)
  const bgResumeInterval = useRef<number | null>(null);
  useEffect(() => {
    function startBgResume() {
      if (bgResumeInterval.current != null) return;
      bgResumeInterval.current = window.setInterval(() => {
        if (playerRef.current && isPlaying) {
          try {
            playerRef.current.playVideo();
          } catch (e) {
            // Ignore - play can be blocked by browser policy
          }
        }
      }, 1000);
    }
    function stopBgResume() {
      if (bgResumeInterval.current != null) {
        clearInterval(bgResumeInterval.current);
        bgResumeInterval.current = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        if (isPlaying) startBgResume();
      } else {
        stopBgResume();
        if (isPlaying && playerRef.current) {
          try {
            playerRef.current.playVideo();
          } catch (e) {
            console.warn('[Player] resume after visibilitychange failed', e);
          }
        }
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    // If already hidden when mounted
    if (document.visibilityState === 'hidden' && isPlaying) {
      startBgResume();
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopBgResume();
    };
  }, [isPlaying]);

  // Integrate Media Session (helps some platforms keep playback alive and provides controls)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        // Update playback state
        (navigator as any).mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        // Set basic handlers
        (navigator as any).mediaSession.setActionHandler?.('play', () => {
          usePlayerStore.getState().setIsPlaying(true);
          try { playerRef.current?.playVideo(); } catch {}
        });
        (navigator as any).mediaSession.setActionHandler?.('pause', () => {
          usePlayerStore.getState().setIsPlaying(false);
          try { playerRef.current?.pauseVideo(); } catch {}
        });
      } catch (e) {
        // ignore if mediaSession not fully supported
      }
    }
  }, [isPlaying]);

  const onStateChange = useCallback((event: YouTubeEvent) => {
    const state = event.data;
    switch (state) {
      case PLAYER_STATES.ENDED:
        if (repeatMode === 'one') {
          event.target?.seekTo?.(0);
          event.target?.playVideo?.();
        } else {
          nextTrack();
        }
        break;
      case PLAYER_STATES.BUFFERING:
        // Don't set global loading for transient buffering to avoid layout shift
        break;
      case PLAYER_STATES.PLAYING:
        setIsLoading(false);
        // Log to played history when a track actually starts playing
        try {
          const current = usePlayerStore.getState().currentTrack;
          if (current) {
            const add = require('@/stores/historyStore').useHistoryStore.getState().addEntry;
            add(current);
          }
        } catch (e) {
          // ignore logging errors
        }
        break;
      case PLAYER_STATES.PAUSED:
        setIsLoading(false);
        // When visible, treat PAUSED as a user action and update app state so it doesn't auto-resume.
        if (!document.hidden) {
          try {
            setIsPlaying(false);
          } catch (e) {
            // no-op if setting state fails for any reason
          }
        }
        // If the page is hidden and playback is expected, the bgResumeInterval will handle resuming.
        break;
      case PLAYER_STATES.CUED:
        setIsLoading(false);
        break;
    }
  }, [repeatMode, nextTrack, setIsLoading]);

  const onError = useCallback((event: YouTubeEvent) => {
    const code = (event as any)?.data;
    const reason = code ? (YOUTUBE_ERROR_CODES[code] ?? 'UNKNOWN_ERROR') : 'NO_CODE';
    const trackId = currentTrackIdRef.current ?? currentTrack?.id ?? 'unknown';
    console.error('[Player] onError', { code, reason }, 'for track:', trackId);
    setIsLoading(false);
    setTimeout(() => {
      nextTrack();
    }, 1000);
  }, [setIsLoading, nextTrack]);

  if (compact) {
    // Compact mini player UI for footer / small screens
    return (
      <div className="flex items-center gap-2 p-1">
        {currentTrack ? (
          <>
            <div className="w-36 h-20 bg-black rounded overflow-hidden">
              <YouTube
                key={currentTrack.id}
                videoId={currentTrack.youtubeId}
                opts={{
                  ...YOUTUBE_PLAYER_OPTIONS,
                  width: 320,
                  height: 180,
                }}
                onReady={onReady}
                onStateChange={onStateChange}
                onError={onError}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[11px] text-terminal-text truncate w-36">{currentTrack.title}</div>
              <div className="font-mono text-[10px] text-terminal-muted truncate w-36">{currentTrack.artist || ''}</div>
            </div>
          </>
        ) : (
          <div className="font-mono text-[10px] text-terminal-muted">No track</div>
        )}
      </div>
    );
  }

  return (
    <TerminalWindow 
      title={currentTrack ? `♪ ${currentTrack.title}` : '♪ NO TRACK'}
      className="h-full"
    >
      <div className="player-container">
        {currentTrack ? (
          <>
            <div>
              <YouTube
                key={currentTrack.id}
                videoId={currentTrack.youtubeId}
                opts={YOUTUBE_PLAYER_OPTIONS}
                onReady={onReady}
                onStateChange={onStateChange}
                onError={onError}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-terminal-bg-secondary">
            <div className="text-center">
              <div className="font-mono text-terminal-muted text-3xl mb-2">▶</div>
              <p className="font-mono text-xs text-terminal-muted">
                Select a genre to start
              </p>
            </div>
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}

export const Player = React.memo(PlayerComponent);

