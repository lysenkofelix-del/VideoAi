/**
 * Media Types - Core types for media file management
 */

export type MediaType = 'video' | 'image' | 'audio' | 'title';

export interface MediaMetadata {
  width?: number;
  height?: number;
  frameRate?: number;
  codec?: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  fileSize: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface MediaItem {
  id: string;                    // UUID
  displayNumber: number;         // 🔢 НОМЕР ДЛЯ AI (1, 2, 3...)
  type: MediaType;
  name: string;
  path: string;
  thumbnail: string;
  duration?: number;             // В миллисекундах
  metadata: MediaMetadata;
}

export interface MediaImportOptions {
  generateThumbnail?: boolean;
  extractMetadata?: boolean;
  analyzeContent?: boolean;      // AI анализ контента
}

export interface MediaSearchQuery {
  text?: string;
  type?: MediaType;
  number?: number;               // Поиск по номеру
  tags?: string[];
}
