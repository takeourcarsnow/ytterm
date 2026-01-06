'use client';

import { useEffect, useRef, useCallback } from 'react';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { usePlayerStore, usePlaylistStore } from '@/stores';
import { YOUTUBE_PLAYER_OPTIONS, PLAYER_STATES } from '@/lib/youtube';
import { TerminalWindow } from '@/components/terminal';
import { Loading } from '@/components/ui';
import { playerManager } from '@/lib/playerManager';

export function Player() {
  const {
    currentTrack,
    volume,
    isMuted,
    isLoading,
    setIsPlaying,
    setDuration,
    setProgress,
    setIsLoading,
    repeatMode,
  } = usePlayerStore();

  const { nextTrack } = usePlaylistStore();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const currentVideoId = useRef<string | null>(null);

  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      const t = playerManager.getCurrentTime();
      if (!isNaN(t)) setProgress(t);
    }, 500);
  }, [setProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const onReady = useCallback((event: YouTubeEvent) => {
    // Stop any previous player before setting new one
    playerManager.setPlayer(event.target);
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
    currentVideoId.current = currentTrack?.youtubeId || null;
  }, [volume, isMuted, currentTrack?.youtubeId]);

  const onStateChange = useCallback((event: YouTubeEvent) => {
    const state = event.data;
    switch (state) {
      case PLAYER_STATES.PLAYING:
        setIsPlaying(true);
        setIsLoading(false);
        setDuration(event.target.getDuration());
        startProgressTracking();
        break;
      case PLAYER_STATES.PAUSED:
        setIsPlaying(false);
        stopProgressTracking();
        break;
      case PLAYER_STATES.ENDED:
        stopProgressTracking();
        setIsPlaying(false);
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
      case PLAYER_STATES.CUED:
        setIsLoading(false);
        break;
    }
  }, [setIsPlaying, setIsLoading, setDuration, startProgressTracking, stopProgressTracking, repeatMode, nextTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      playerManager.destroy();
    };
  }, [stopProgressTracking]);

  // Stop previous track when changing tracks
  useEffect(() => {
    if (currentTrack?.youtubeId && currentVideoId.current && currentTrack.youtubeId !== currentVideoId.current) {
      playerManager.stop();
    }
  }, [currentTrack?.youtubeId]);

  const onError = useCallback(() => {
    setIsLoading(false);
    setIsPlaying(false);
    setTimeout(() => {
      nextTrack();
    }, 1000);
  }, [setIsLoading, setIsPlaying, nextTrack]);

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
                key={currentTrack.youtubeId}
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
