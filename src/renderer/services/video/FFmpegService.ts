/**
 * FFmpeg Service - Video processing, encoding, and rendering
 */

import { MediaItem, Clip, Effect, Transition } from '@shared/types';

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  timeRemaining: number; // seconds
  currentClip?: string;
}

export interface ExportOptions {
  format: 'mp4' | 'mov' | 'webm' | 'avi';
  codec: 'h264' | 'h265' | 'vp9' | 'prores';
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  bitrate: number; // kbps
  quality: 'low' | 'medium' | 'high' | 'ultra';
  audioCodec: 'aac' | 'mp3' | 'opus';
  audioBitrate: number; // kbps
}

export class FFmpegService {
  private static instance: FFmpegService;
  private ffmpegLoaded = false;
  private renderCallbacks: Map<string, (progress: RenderProgress) => void> = new Map();

  private constructor() {
    this.initFFmpeg();
  }

  static getInstance(): FFmpegService {
    if (!FFmpegService.instance) {
      FFmpegService.instance = new FFmpegService();
    }
    return FFmpegService.instance;
  }

  /**
   * Initialize FFmpeg
   */
  private async initFFmpeg(): Promise<void> {
    try {
      // In Electron, FFmpeg is available via native bindings
      // Check if FFmpeg is available
      const ffmpegPath = await window.electron?.getFFmpegPath();
      if (ffmpegPath) {
        this.ffmpegLoaded = true;
        console.log('✅ FFmpeg initialized:', ffmpegPath);
      } else {
        console.warn('⚠️ FFmpeg not available - using mock service');
      }
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
    }
  }

  /**
   * Extract frame from video at specific time
   */
  async extractFrame(videoPath: string, timeMs: number): Promise<string> {
    if (!this.ffmpegLoaded) {
      return this.mockExtractFrame(videoPath, timeMs);
    }

    try {
      const result = await window.electron?.ffmpeg({
        command: 'extractFrame',
        input: videoPath,
        time: timeMs / 1000, // Convert to seconds
        output: 'frame.jpg',
      });

      return result?.framePath || '';
    } catch (error) {
      console.error('Failed to extract frame:', error);
      return this.mockExtractFrame(videoPath, timeMs);
    }
  }

  /**
   * Get video metadata (duration, resolution, etc.)
   */
  async getVideoMetadata(videoPath: string): Promise<any> {
    if (!this.ffmpegLoaded) {
      return this.mockGetMetadata(videoPath);
    }

    try {
      const result = await window.electron?.ffmpeg({
        command: 'probe',
        input: videoPath,
      });

      return {
        duration: result?.duration || 0,
        width: result?.width || 1920,
        height: result?.height || 1080,
        frameRate: result?.frameRate || 30,
        codec: result?.codec || 'h264',
        bitrate: result?.bitrate || 5000,
      };
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return this.mockGetMetadata(videoPath);
    }
  }

  /**
   * Apply effect to video clip
   */
  async applyEffect(
    clip: Clip,
    effect: Effect,
    outputPath: string
  ): Promise<string> {
    if (!this.ffmpegLoaded) {
      console.log(`Mock: Applying effect ${effect.name} to clip ${clip.id}`);
      return outputPath;
    }

    try {
      const filterString = this.buildEffectFilter(effect);

      const result = await window.electron?.ffmpeg({
        command: 'filter',
        input: clip.mediaId, // Will be resolved to actual path
        filter: filterString,
        output: outputPath,
      });

      return result?.outputPath || outputPath;
    } catch (error) {
      console.error('Failed to apply effect:', error);
      return outputPath;
    }
  }

  /**
   * Build FFmpeg filter string for effect
   */
  private buildEffectFilter(effect: Effect): string {
    const params = effect.parameters;

    switch (effect.type) {
      case 'color':
        return `eq=brightness=${params.brightness || 0}:contrast=${params.contrast || 1}:saturation=${params.saturation || 1}`;

      case 'blur':
        return `boxblur=${params.radius || 5}`;

      case 'sharpen':
        return `unsharp=5:5:${params.amount || 1}:5:5:0`;

      case 'scale':
        return `scale=${params.width || -1}:${params.height || -1}`;

      case 'rotate':
        return `rotate=${params.angle || 0}*PI/180`;

      case 'chromakey':
        return `chromakey=${params.color || 'green'}:${params.similarity || 0.3}:${params.blend || 0.1}`;

      case 'colorize':
        return `colorize=hue=${params.hue || 0}:saturation=${params.saturation || 1}`;

      default:
        return 'null'; // No effect
    }
  }

  /**
   * Apply transition between two clips
   */
  async applyTransition(
    clip1Path: string,
    clip2Path: string,
    transition: Transition,
    outputPath: string
  ): Promise<string> {
    if (!this.ffmpegLoaded) {
      console.log(`Mock: Applying transition ${transition.type}`);
      return outputPath;
    }

    try {
      const filterString = this.buildTransitionFilter(transition);

      const result = await window.electron?.ffmpeg({
        command: 'xfade',
        inputs: [clip1Path, clip2Path],
        filter: filterString,
        duration: transition.duration / 1000,
        output: outputPath,
      });

      return result?.outputPath || outputPath;
    } catch (error) {
      console.error('Failed to apply transition:', error);
      return outputPath;
    }
  }

  /**
   * Build FFmpeg filter for transition
   */
  private buildTransitionFilter(transition: Transition): string {
    const duration = transition.duration / 1000;

    switch (transition.type) {
      case 'dissolve':
        return `xfade=transition=fade:duration=${duration}`;

      case 'wipeLeft':
        return `xfade=transition=wipeleft:duration=${duration}`;

      case 'wipeRight':
        return `xfade=transition=wiperight:duration=${duration}`;

      case 'slideLeft':
        return `xfade=transition=slideleft:duration=${duration}`;

      case 'slideRight':
        return `xfade=transition=slideright:duration=${duration}`;

      case 'circleOpen':
        return `xfade=transition=circleopen:duration=${duration}`;

      case 'circleClose':
        return `xfade=transition=circleclose:duration=${duration}`;

      default:
        return `xfade=transition=fade:duration=${duration}`;
    }
  }

  /**
   * Render entire timeline to video file
   */
  async renderTimeline(
    clips: Clip[],
    mediaItems: MediaItem[],
    exportOptions: ExportOptions,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<string> {
    if (!this.ffmpegLoaded) {
      return this.mockRender(clips, exportOptions, outputPath, onProgress);
    }

    try {
      // Generate render ID
      const renderId = `render_${Date.now()}`;
      if (onProgress) {
        this.renderCallbacks.set(renderId, onProgress);
      }

      // Build complex filter graph for timeline
      const filterComplex = this.buildTimelineFilter(clips, mediaItems, exportOptions);

      const result = await window.electron?.ffmpeg({
        command: 'render',
        inputs: this.getInputFiles(clips, mediaItems),
        filterComplex,
        codec: exportOptions.codec,
        resolution: exportOptions.resolution,
        frameRate: exportOptions.frameRate,
        bitrate: exportOptions.bitrate,
        audioCodec: exportOptions.audioCodec,
        audioBitrate: exportOptions.audioBitrate,
        output: outputPath,
        renderId,
      });

      this.renderCallbacks.delete(renderId);
      return result?.outputPath || outputPath;
    } catch (error) {
      console.error('Failed to render timeline:', error);
      throw error;
    }
  }

  /**
   * Build timeline filter graph
   */
  private buildTimelineFilter(
    clips: Clip[],
    mediaItems: MediaItem[],
    options: ExportOptions
  ): string {
    const filters: string[] = [];
    const { width, height } = options.resolution;

    // Sort clips by start time
    const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);

    sortedClips.forEach((clip, index) => {
      const media = mediaItems.find((m) => m.id === clip.mediaId);
      if (!media) return;

      // Scale to output resolution
      filters.push(`[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[v${index}]`);

      // Apply effects
      if (clip.effects && clip.effects.length > 0) {
        clip.effects.forEach((effect) => {
          if (effect.enabled) {
            const effectFilter = this.buildEffectFilter(effect);
            filters.push(`[v${index}]${effectFilter}[v${index}]`);
          }
        });
      }

      // Apply opacity
      if (clip.opacity < 1) {
        filters.push(`[v${index}]format=yuva420p,colorchannelmixer=aa=${clip.opacity}[v${index}]`);
      }
    });

    // Concatenate all clips
    const videoInputs = sortedClips.map((_, i) => `[v${i}]`).join('');
    const audioInputs = sortedClips.map((_, i) => `[${i}:a]`).join('');
    filters.push(`${videoInputs}concat=n=${sortedClips.length}:v=1:a=0[outv]`);
    filters.push(`${audioInputs}concat=n=${sortedClips.length}:v=0:a=1[outa]`);

    return filters.join(';');
  }

  /**
   * Get input files for rendering
   */
  private getInputFiles(clips: Clip[], mediaItems: MediaItem[]): string[] {
    return clips
      .map((clip) => {
        const media = mediaItems.find((m) => m.id === clip.mediaId);
        return media?.path;
      })
      .filter((path): path is string => !!path);
  }

  /**
   * Cancel ongoing render
   */
  async cancelRender(renderId: string): Promise<void> {
    this.renderCallbacks.delete(renderId);
    await window.electron?.ffmpeg({
      command: 'cancel',
      renderId,
    });
  }

  /**
   * Handle render progress update
   */
  handleRenderProgress(renderId: string, progress: RenderProgress): void {
    const callback = this.renderCallbacks.get(renderId);
    if (callback) {
      callback(progress);
    }
  }

  // ========================================
  // MOCK METHODS FOR DEVELOPMENT
  // ========================================

  private mockExtractFrame(videoPath: string, timeMs: number): string {
    // Return placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RnJhbWUgYXQge3RpbWVNc31tczwvdGV4dD48L3N2Zz4=';
  }

  private mockGetMetadata(videoPath: string): any {
    return {
      duration: 10000, // 10 seconds
      width: 1920,
      height: 1080,
      frameRate: 30,
      codec: 'h264',
      bitrate: 5000,
    };
  }

  private async mockRender(
    clips: Clip[],
    options: ExportOptions,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<string> {
    console.log('🎬 Mock Render Started');
    console.log(`  Clips: ${clips.length}`);
    console.log(`  Output: ${outputPath}`);
    console.log(`  Format: ${options.format} (${options.codec})`);
    console.log(`  Resolution: ${options.resolution.width}x${options.resolution.height}`);

    // Simulate render progress
    const totalFrames = 300;
    for (let frame = 0; frame <= totalFrames; frame += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (onProgress) {
        onProgress({
          currentFrame: frame,
          totalFrames,
          percentage: (frame / totalFrames) * 100,
          timeRemaining: ((totalFrames - frame) / 30) * 0.1, // Mock calculation
          currentClip: clips[Math.floor((frame / totalFrames) * clips.length)]?.id,
        });
      }
    }

    console.log('✅ Mock Render Complete');
    return outputPath;
  }
}

// Singleton instance
export const ffmpegService = FFmpegService.getInstance();
