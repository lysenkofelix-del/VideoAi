/**
 * Timeline Types - Types for timeline, tracks, clips, and playback
 */

export type TrackType = 'video' | 'audio' | 'title' | 'adjustment';
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';

export interface Timeline {
  tracks: Track[];
  cursor: number;                // Позиция воспроизведения (мс)
  zoom: number;                  // Масштаб (пикселей на секунду)
  selection: Selection[];
  markers: Marker[];
  duration: number;              // Общая длительность (мс)
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  clips: Clip[];
  locked: boolean;
  visible: boolean;
  volume?: number;               // 0-1, для аудио
  solo?: boolean;                // Только эта дорожка
  muted?: boolean;
}

export interface Clip {
  id: string;
  mediaId: string;               // Ссылка на MediaItem
  mediaNumber: number;           // 🔢 НОМЕР для AI
  trackId: string;
  startTime: number;             // Позиция на таймлайне (мс)
  duration: number;              // Длительность на таймлайне (мс)
  inPoint: number;               // Начало внутри исходника (мс)
  outPoint: number;              // Конец внутри исходника (мс)
  effects: Effect[];
  transitions: {
    in?: Transition;
    out?: Transition;
  };
  animation: AnimationKeyframes[];
  speed: number;                 // 1.0 = нормальная скорость
  volume: number;                // 0-1
  opacity: number;               // 0-1
}

export interface Selection {
  type: 'clip' | 'track' | 'marker';
  id: string;
}

export interface Marker {
  id: string;
  time: number;                  // мс
  label: string;
  color?: string;
}

export interface Effect {
  id: string;
  type: string;                  // 'color', 'transform', 'style', 'ai'
  name: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface Transition {
  id: string;
  type: string;                  // 'dissolve', 'fade', 'wipe', 'slide', etc.
  duration: number;              // мс
  parameters: Record<string, any>;
}

export interface AnimationKeyframes {
  property: 'position' | 'scale' | 'rotation' | 'opacity';
  keyframes: Keyframe[];
  easing: EasingType;
}

export interface Keyframe {
  time: number;                  // мс от начала клипа
  value: number | { x: number; y: number };
}
