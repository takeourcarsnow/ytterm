// YouTube utilities and helpers

export const YOUTUBE_PLAYER_OPTIONS = {
  height: '100%',
  width: '100%',
  playerVars: {
    autoplay: 1,
    controls: 1,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
    showinfo: 0,
    origin: typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '',
  },
};

export interface YouTubePlayerState {
  UNSTARTED: -1;
  ENDED: 0;
  PLAYING: 1;
  PAUSED: 2;
  BUFFERING: 3;
  CUED: 5;
}

export const PLAYER_STATES: YouTubePlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: '0',
    modestbranding: '1',
    rel: '0',
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}
