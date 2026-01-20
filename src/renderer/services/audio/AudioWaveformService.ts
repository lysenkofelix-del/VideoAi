/**
 * Audio Waveform Service - Visualize audio waveforms on timeline
 */

export interface WaveformData {
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
  channels: number;
}

export interface WaveformOptions {
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  pixelsPerSecond: number;
}

export class AudioWaveformService {
  private static instance: AudioWaveformService;
  private audioContext: AudioContext | null = null;
  private waveformCache: Map<string, WaveformData> = new Map();

  private constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  static getInstance(): AudioWaveformService {
    if (!AudioWaveformService.instance) {
      AudioWaveformService.instance = new AudioWaveformService();
    }
    return AudioWaveformService.instance;
  }

  /**
   * Generate waveform data from audio file
   */
  async generateWaveform(audioPath: string): Promise<WaveformData> {
    // Check cache
    if (this.waveformCache.has(audioPath)) {
      return this.waveformCache.get(audioPath)!;
    }

    console.log('🎵 Generating waveform for:', audioPath);

    try {
      // In real implementation:
      // 1. Load audio file
      // 2. Decode with Web Audio API
      // 3. Extract peak data
      // 4. Downsample for performance

      // Mock for now
      const mockData: WaveformData = {
        peaks: this.generateMockPeaks(1000),
        duration: 10000, // 10 seconds
        sampleRate: 44100,
        channels: 2,
      };

      this.waveformCache.set(audioPath, mockData);
      return mockData;
    } catch (error) {
      console.error('Failed to generate waveform:', error);
      throw error;
    }
  }

  /**
   * Generate mock peaks for demo
   */
  private generateMockPeaks(samples: number): Float32Array {
    const peaks = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      // Generate realistic audio wave pattern
      peaks[i] = Math.sin(i / 10) * 0.5 + Math.random() * 0.3;
    }
    return peaks;
  }

  /**
   * Draw waveform to canvas
   */
  drawWaveform(
    canvas: HTMLCanvasElement,
    waveformData: WaveformData,
    options: WaveformOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { peaks } = waveformData;
    const { width, height, color, backgroundColor, pixelsPerSecond } = options;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    const step = peaks.length / width;
    const amplitude = height / 2;

    for (let x = 0; x < width; x++) {
      const peakIndex = Math.floor(x * step);
      const peak = peaks[peakIndex] || 0;
      const y = amplitude + peak * amplitude;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, amplitude);
    ctx.lineTo(width, amplitude);
    ctx.stroke();
  }

  /**
   * Get audio level at specific time
   */
  getAudioLevelAtTime(waveformData: WaveformData, timeMs: number): number {
    const { peaks, duration } = waveformData;
    const progress = timeMs / duration;
    const index = Math.floor(progress * peaks.length);
    return Math.abs(peaks[index] || 0);
  }

  /**
   * Detect beats in audio
   */
  async detectBeats(audioPath: string): Promise<number[]> {
    console.log('🥁 Detecting beats in:', audioPath);

    // In real implementation, use beat detection algorithm
    // For now, return mock beat timestamps

    const beats: number[] = [];
    const bpm = 120; // Mock BPM
    const beatInterval = (60 / bpm) * 1000; // ms between beats

    for (let time = 0; time < 60000; time += beatInterval) {
      beats.push(time);
    }

    return beats;
  }

  /**
   * Normalize audio levels
   */
  async normalizeAudio(audioPath: string): Promise<string> {
    console.log('🔊 Normalizing audio:', audioPath);

    // In real implementation:
    // 1. Analyze audio levels
    // 2. Calculate normalization factor
    // 3. Apply gain using FFmpeg
    // 4. Export normalized file

    return audioPath; // Mock
  }

  /**
   * Clear waveform cache
   */
  clearCache(audioPath?: string): void {
    if (audioPath) {
      this.waveformCache.delete(audioPath);
    } else {
      this.waveformCache.clear();
    }
  }

  /**
   * Export waveform as image
   */
  exportWaveformImage(
    waveformData: WaveformData,
    options: WaveformOptions
  ): string {
    const canvas = document.createElement('canvas');
    this.drawWaveform(canvas, waveformData, options);
    return canvas.toDataURL('image/png');
  }
}

// Singleton instance
export const audioWaveformService = AudioWaveformService.getInstance();
