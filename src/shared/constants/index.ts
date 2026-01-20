/**
 * Shared Constants
 */

export * from './effects';

// Media type icons
export const MEDIA_TYPE_ICONS = {
  video: '🎬',
  image: '🖼️',
  audio: '🎵',
  title: '📝',
} as const;

// Default project settings
export const DEFAULT_PROJECT_SETTINGS = {
  resolution: {
    width: 1920,
    height: 1080,
  },
  frameRate: 30,
  sampleRate: 48000,
  colorSpace: 'rec709' as const,
};

// Timeline constants
export const TIMELINE_CONSTANTS = {
  MIN_ZOOM: 10,              // пикселей на секунду
  MAX_ZOOM: 500,
  DEFAULT_ZOOM: 50,
  TRACK_HEIGHT: 60,          // пикселей
  RULER_HEIGHT: 30,
  MIN_CLIP_DURATION: 100,    // мс
};

// Export presets
export const EXPORT_PRESETS = {
  'youtube_1080p': {
    format: 'mp4' as const,
    resolution: '1080p' as const,
    frameRate: 30 as const,
    codec: 'h264' as const,
    quality: 'high' as const,
    audioCodec: 'aac' as const,
  },
  'youtube_4k': {
    format: 'mp4' as const,
    resolution: '4k' as const,
    frameRate: 30 as const,
    codec: 'h265' as const,
    quality: 'high' as const,
    audioCodec: 'aac' as const,
  },
  'instagram': {
    format: 'mp4' as const,
    resolution: '1080p' as const,
    frameRate: 30 as const,
    codec: 'h264' as const,
    quality: 'medium' as const,
    audioCodec: 'aac' as const,
  },
} as const;
