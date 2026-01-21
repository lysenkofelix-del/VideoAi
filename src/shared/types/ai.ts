/**
 * AI Types - Types for AI assistant functionality
 */

export type AICommandType =
  | 'insert'
  | 'trim'
  | 'transition'
  | 'effect'
  | 'animation'
  | 'generate'
  | 'analyze'
  | 'move'
  | 'delete';

export interface AICommand {
  type: AICommandType;
  mediaReferences: number[];     // Номера медиафайлов
  parameters: Record<string, any>;
  timeRange?: { start: number; end: number };
  description?: string;          // Описание намерения пользователя
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AICommand[];
  preview?: PreviewData;
  isError?: boolean;
  timestamp: Date;
}

export interface PreviewData {
  explanation: string;
  needsConfirmation: boolean;
  affectedClips: string[];       // IDs клипов
  visualPreview?: any;           // Данные для визуального превью
}

export interface ProjectContext {
  mediaItems: Array<{
    number: number;
    type: string;
    name: string;
    duration?: number;
  }>;
  timelineState: {
    tracks: number;
    totalDuration: number;
    clipsCount: number;
  };
  availableEffects: string[];
  availableTransitions: string[];
}

export interface AIAnalysisResult {
  scenes?: SceneDetection[];
  faces?: FaceDetection[];
  speech?: SpeechSegment[];
  objects?: ObjectDetection[];
  mood?: MoodAnalysis;
  suggestedCuts?: number[];
}

export interface SceneDetection {
  startTime: number;
  endTime: number;
  confidence: number;
  description?: string;
}

export interface FaceDetection {
  time: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface SpeechSegment {
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  speaker?: string;
}

export interface ObjectDetection {
  time: number;
  label: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface MoodAnalysis {
  overall: 'positive' | 'negative' | 'neutral' | 'energetic' | 'calm';
  confidence: number;
  keywords: string[];
}

export interface InsertPoint {
  time: number;
  confidence: number;
  reason: string;
}
