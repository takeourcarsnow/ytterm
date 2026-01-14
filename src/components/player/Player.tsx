'use client';

import { useCallback, useRef, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { usePlayerStore, usePlaylistStore } from '@/stores';
import { YOUTUBE_PLAYER_OPTIONS, PLAYER_STATES } from '@/lib/youtube';
import { TerminalWindow } from '@/components/terminal';
import { Loading } from '@/components/ui';

export function Player() {
  const { currentTrack, isLoading, setIsLoading, repeatMode } = usePlayerStore();
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
  }, [currentTrack?.id]);

  const onStateChange = useCallback((event: YouTubeEvent) => {
    const state = event.data;
    switch (state) {
      case PLAYER_STATES.ENDED:
        if (repeatMode === 'one') {
          event.target.seekTo(0);
          event.target.playVideo();
        } else {
          nextTrack();
        }
        break;
      case PLAYER_STATES.BUFFERING:
        setIsLoading(true);
        break;
      case PLAYER_STATES.PLAYING:
      case PLAYER_STATES.PAUSED:
      case PLAYER_STATES.CUED:
        setIsLoading(false);
        break;
    }
  }, [repeatMode, nextTrack, setIsLoading]);

  const onError = useCallback((event: YouTubeEvent) => {
    console.error('[Player] onError', event, 'for track:', currentTrack?.id);
    setIsLoading(false);
    setTimeout(() => {
      nextTrack();
    }, 1000);
  }, [setIsLoading, nextTrack, currentTrack?.id]);

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
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                <Loading text="Buffering" />
              </div>
            )}
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
