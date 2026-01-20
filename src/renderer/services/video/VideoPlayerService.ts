/**
 * Video Player Service - Handles timeline playback and preview rendering
 */

import { Clip, MediaItem, Track } from '@shared/types';
import { ffmpegService } from './FFmpegService';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number; // ms
  duration: number; // ms
  frameRate: number;
  volume: number; // 0-1
}

export class VideoPlayerService {
  private static instance: VideoPlayerService;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    frameRate: 30,
    volume: 1,
  };
  private videoCache: Map<string, HTMLVideoElement> = new Map();
  private onTimeUpdateCallbacks: Set<(time: number) => void> = new Set();

  private constructor() {}

  static getInstance(): VideoPlayerService {
    if (!VideoPlayerService.instance) {
      VideoPlayerService.instance = new VideoPlayerService();
    }
    return VideoPlayerService.instance;
  }

  /**
   * Initialize player with canvas
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = ctx;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    console.log('✅ Video Player initialized');
  }

  /**
   * Load timeline for playback
   */
  loadTimeline(tracks: Track[], mediaItems: MediaItem[], duration: number): void {
    this.playbackState.duration = duration;

    // Preload video elements for all clips
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const media = mediaItems.find((m) => m.id === clip.mediaId);
        if (media && media.type === 'video' && !this.videoCache.has(clip.mediaId)) {
          this.preloadVideo(media.path, clip.mediaId);
        }
      });
    });
  }

  /**
   * Preload video element
   */
  private preloadVideo(path: string, mediaId: string): void {
    const video = document.createElement('video');
    video.src = path;
    video.preload = 'auto';
    video.muted = true; // Muted for background loading
    this.videoCache.set(mediaId, video);
  }

  /**
   * Play timeline
   */
  play(): void {
    if (this.playbackState.isPlaying) return;

    this.playbackState.isPlaying = true;
    const startTime = performance.now();
    const startPosition = this.playbackState.currentTime;

    const animate = (currentTime: number) => {
      if (!this.playbackState.isPlaying) return;

      const elapsed = currentTime - startTime;
      this.playbackState.currentTime = startPosition + elapsed;

      // Stop at end
      if (this.playbackState.currentTime >= this.playbackState.duration) {
        this.pause();
        this.playbackState.currentTime = this.playbackState.duration;
      }

      // Notify listeners
      this.notifyTimeUpdate(this.playbackState.currentTime);

      // Continue animation
      if (this.playbackState.isPlaying) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.playbackState.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.pause();
    this.seek(0);
  }

  /**
   * Seek to specific time
   */
  seek(timeMs: number): void {
    this.playbackState.currentTime = Math.max(0, Math.min(timeMs, this.playbackState.duration));
    this.notifyTimeUpdate(this.playbackState.currentTime);
  }

  /**
   * Step forward one frame
   */
  stepForward(): void {
    const frameTime = 1000 / this.playbackState.frameRate;
    this.seek(this.playbackState.currentTime + frameTime);
  }

  /**
   * Step backward one frame
   */
  stepBackward(): void {
    const frameTime = 1000 / this.playbackState.frameRate;
    this.seek(this.playbackState.currentTime - frameTime);
  }

  /**
   * Render current frame to canvas
   */
  async renderFrame(
    tracks: Track[],
    mediaItems: MediaItem[],
    currentTime: number
  ): Promise<void> {
    if (!this.canvas || !this.ctx) {
      console.warn('[VideoPlayer] Canvas not initialized');
      return;
    }

    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Find all clips at current time (from all tracks)
    const activeClips = this.getActiveClips(tracks, currentTime);

    if (activeClips.length === 0) {
      // No active clips - show placeholder
      this.ctx.fillStyle = '#444';
      this.ctx.font = '36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Нет клипов на текущей позиции', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#666';
      const minutes = Math.floor(currentTime / 60000);
      const seconds = Math.floor((currentTime % 60000) / 1000);
      this.ctx.fillText(`Позиция: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
      this.ctx.font = '18px Arial';
      this.ctx.fillStyle = '#555';
      this.ctx.fillText('Перетащите медиа на видео дорожку', this.canvas.width / 2, this.canvas.height / 2 + 70);
      // Removed excessive logging that fires on every frame
      return;
    }

    // Render clips from bottom to top (respecting track order)
    for (const { clip, track } of activeClips) {
      if (!track.visible) continue;

      const media = mediaItems.find((m) => m.id === clip.mediaId);
      if (!media) {
        console.warn(`[VideoPlayer] Media not found for clip ${clip.id}`);
        continue;
      }

      // Calculate time within clip
      const clipTime = currentTime - clip.startTime + clip.inPoint;

      // Render based on media type
      try {
        switch (media.type) {
          case 'video':
            await this.renderVideoClip(clip, media, clipTime);
            break;
          case 'image':
            await this.renderImageClip(clip, media);
            break;
          case 'title':
            this.renderTitleClip(clip);
            break;
        }
      } catch (error) {
        console.error(`[VideoPlayer] Error rendering clip:`, error);
        this.renderPlaceholder(clip, media);
      }
    }
  }

  /**
   * Get all clips active at current time
   */
  private getActiveClips(tracks: Track[], currentTime: number): Array<{ clip: Clip; track: Track }> {
    const activeClips: Array<{ clip: Clip; track: Track }> = [];

    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const clipEnd = clip.startTime + clip.duration;
        if (currentTime >= clip.startTime && currentTime < clipEnd) {
          activeClips.push({ clip, track });
        }
      });
    });

    return activeClips;
  }

  /**
   * Render video clip
   */
  private async renderVideoClip(clip: Clip, media: MediaItem, clipTime: number): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    const video = this.videoCache.get(clip.mediaId);
    if (!video) {
      // Fallback: show placeholder
      this.renderPlaceholder(clip, media);
      return;
    }

    // Seek video to correct time
    const videoTime = clipTime / 1000; // Convert to seconds
    if (Math.abs(video.currentTime - videoTime) > 0.1) {
      video.currentTime = videoTime;
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });
    }

    // Apply clip transformations and effects
    this.ctx.save();
    this.ctx.globalAlpha = clip.opacity;

    // Draw video frame
    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

    this.ctx.restore();
  }

  /**
   * Render image clip
   */
  private async renderImageClip(clip: Clip, media: MediaItem): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    const img = new Image();
    img.src = media.path;

    await new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
      }
    });

    this.ctx.save();
    this.ctx.globalAlpha = clip.opacity;
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Render title clip
   */
  private renderTitleClip(clip: Clip): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.save();
    this.ctx.globalAlpha = clip.opacity;
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Title Clip', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.restore();
  }

  /**
   * Render placeholder for missing media
   */
  private renderPlaceholder(clip: Clip, media: MediaItem): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.save();
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Media #${clip.mediaNumber}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(media.name, this.canvas.width / 2, this.canvas.height / 2 + 50);
    this.ctx.restore();
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.playbackState.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Subscribe to time updates
   */
  onTimeUpdate(callback: (time: number) => void): () => void {
    this.onTimeUpdateCallbacks.add(callback);
    return () => this.onTimeUpdateCallbacks.delete(callback);
  }

  /**
   * Notify time update listeners
   */
  private notifyTimeUpdate(time: number): void {
    this.onTimeUpdateCallbacks.forEach((callback) => callback(time));
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.pause();
    this.videoCache.forEach((video) => {
      video.pause();
      video.src = '';
    });
    this.videoCache.clear();
    this.onTimeUpdateCallbacks.clear();
  }
}

// Singleton instance
export const videoPlayerService = VideoPlayerService.getInstance();
