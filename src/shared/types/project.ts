/**
 * Project Types - Types for project management
 */

import { Timeline } from './timeline';
import { MediaItem } from './media';

export interface Project {
  id: string;
  name: string;
  timeline: Timeline;
  mediaItems: MediaItem[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

export interface ProjectSettings {
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  sampleRate: number;
  colorSpace: 'rec709' | 'rec2020' | 'srgb';
}

export interface ProjectMetadata {
  createdAt: Date;
  modifiedAt: Date;
  author?: string;
  description?: string;
  tags?: string[];
}

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'webm' | 'gif';
  resolution: '1080p' | '4k' | 'custom';
  customResolution?: { width: number; height: number };
  frameRate: 24 | 30 | 60;
  codec: 'h264' | 'h265' | 'prores' | 'vp9';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  audioCodec: 'aac' | 'mp3' | 'wav';
  outputPath: string;
}

export interface ExportProgress {
  phase: 'preparing' | 'encoding' | 'finalizing';
  progress: number;              // 0-100
  currentFrame?: number;
  totalFrames?: number;
  estimatedTimeRemaining?: number; // секунды
}
