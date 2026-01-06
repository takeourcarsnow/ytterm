import type { YouTubePlayer } from 'react-youtube';

class PlayerManager {
  private player: YouTubePlayer | null = null;
  private volume: number = 80;

  setPlayer(player: YouTubePlayer | null) {
    // Stop any existing player before setting new one
    this.stop();
    this.player = player;
  }

  stop() {
    if (this.player) {
      try {
        this.player.stopVideo();
      } catch (e) {
        // Player might be destroyed
      }
    }
  }

  play() {
    if (this.player) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player) {
      this.player.pauseVideo();
    }
  }

  seekTo(seconds: number) {
    this.player?.seekTo(seconds, true);
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.player?.setVolume(volume);
  }

  getVolume(): number {
    return this.volume;
  }

  mute() {
    this.player?.mute();
  }

  unMute() {
    this.player?.unMute();
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  getPlayerState(): number {
    return this.player?.getPlayerState() ?? -1;
  }

  destroy() {
    this.stop();
    this.player = null;
  }
}

export const playerManager = new PlayerManager();
