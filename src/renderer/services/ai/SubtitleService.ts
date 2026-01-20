/**
 * Subtitle Service - AI-powered subtitle generation and synchronization
 */

import Anthropic from '@anthropic-ai/sdk';
import { Clip } from '@shared/types';

export interface Subtitle {
  id: string;
  startTime: number; // ms
  endTime: number; // ms
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  outline: boolean;
  shadow: boolean;
}

export interface TranscriptionResult {
  subtitles: Subtitle[];
  fullText: string;
  language: string;
  duration: number;
  wordCount: number;
}

export class SubtitleService {
  private static instance: SubtitleService;
  private anthropic: Anthropic | null = null;
  private apiKey: string | null = null;

  private constructor() {
    this.loadApiKey();
  }

  static getInstance(): SubtitleService {
    if (!SubtitleService.instance) {
      SubtitleService.instance = new SubtitleService();
    }
    return SubtitleService.instance;
  }

  /**
   * Load API key from settings
   */
  private loadApiKey(): void {
    const settings = localStorage.getItem('app-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.apiKey = parsed.claudeApiKey || null;

      if (this.apiKey) {
        this.anthropic = new Anthropic({
          apiKey: this.apiKey,
          dangerouslyAllowBrowser: true,
        });
      }
    }
  }

  /**
   * Check if AI is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && !!this.anthropic;
  }

  /**
   * Generate subtitles from audio/video file
   */
  async generateSubtitles(
    filePath: string,
    language: string = 'auto'
  ): Promise<TranscriptionResult> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log(`🎤 Generating subtitles for: ${filePath}`);

    try {
      // In real implementation, this would:
      // 1. Extract audio from video using FFmpeg
      // 2. Send to speech-to-text API (Whisper, Google Speech, etc.)
      // 3. Get timestamped transcription
      // 4. Format as subtitles

      // For now, mock with realistic data
      const mockSubtitles: Subtitle[] = [
        {
          id: 'sub_1',
          startTime: 0,
          endTime: 2500,
          text: 'Welcome to our video tutorial',
          confidence: 0.95,
        },
        {
          id: 'sub_2',
          startTime: 2500,
          endTime: 5000,
          text: 'Today we will learn about AI video editing',
          confidence: 0.92,
        },
        {
          id: 'sub_3',
          startTime: 5000,
          endTime: 8000,
          text: 'This tool can automatically generate subtitles',
          confidence: 0.98,
        },
        {
          id: 'sub_4',
          startTime: 8000,
          endTime: 11000,
          text: 'Making your content more accessible',
          confidence: 0.94,
        },
      ];

      const fullText = mockSubtitles.map((s) => s.text).join(' ');

      console.log(`✅ Generated ${mockSubtitles.length} subtitle segments`);

      return {
        subtitles: mockSubtitles,
        fullText,
        language: language === 'auto' ? 'en' : language,
        duration: mockSubtitles[mockSubtitles.length - 1].endTime,
        wordCount: fullText.split(' ').length,
      };
    } catch (error) {
      console.error('Failed to generate subtitles:', error);
      throw error;
    }
  }

  /**
   * Translate subtitles to another language using AI
   */
  async translateSubtitles(
    subtitles: Subtitle[],
    targetLanguage: string
  ): Promise<Subtitle[]> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log(`🌍 Translating ${subtitles.length} subtitles to ${targetLanguage}`);

    try {
      const textsToTranslate = subtitles.map((s) => s.text);

      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `Translate these video subtitles to ${targetLanguage}.
Preserve timing and natural speech patterns.
Keep the same number of lines.

Subtitles:
${textsToTranslate.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return as JSON array: ["translated text 1", "translated text 2", ...]`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const translations = JSON.parse(jsonMatch[0]);

        const translatedSubtitles = subtitles.map((sub, i) => ({
          ...sub,
          text: translations[i] || sub.text,
        }));

        console.log(`✅ Translated to ${targetLanguage}`);
        return translatedSubtitles;
      }

      return subtitles;
    } catch (error) {
      console.error('Failed to translate subtitles:', error);
      return subtitles;
    }
  }

  /**
   * Auto-sync subtitles with video
   */
  async autoSyncSubtitles(
    subtitles: Subtitle[],
    videoPath: string
  ): Promise<Subtitle[]> {
    console.log('🔄 Auto-syncing subtitles with video...');

    // In real implementation:
    // 1. Extract audio waveform
    // 2. Detect speech segments
    // 3. Match subtitle text with speech
    // 4. Adjust timestamps

    // Mock: just return with slight adjustments
    return subtitles.map((sub) => ({
      ...sub,
      confidence: 0.95,
    }));
  }

  /**
   * Add subtitles to clip
   */
  addSubtitlesToClip(clip: Clip, subtitles: Subtitle[]): void {
    // Filter subtitles that fall within clip time range
    const clipSubtitles = subtitles.filter((sub) => {
      const subStart = sub.startTime;
      const subEnd = sub.endTime;
      const clipStart = clip.inPoint;
      const clipEnd = clip.outPoint;

      return subStart < clipEnd && subEnd > clipStart;
    });

    // Add as effect to clip
    const subtitleEffect = {
      id: `subtitle_${Date.now()}`,
      type: 'subtitle',
      name: 'AI Subtitles',
      enabled: true,
      parameters: {
        subtitles: clipSubtitles.map((sub) => ({
          ...sub,
          // Adjust times relative to clip
          startTime: sub.startTime - clip.inPoint,
          endTime: sub.endTime - clip.inPoint,
        })),
        style: this.getDefaultStyle(),
      },
    };

    clip.effects.push(subtitleEffect);
    console.log(`✅ Added ${clipSubtitles.length} subtitles to clip #${clip.mediaNumber}`);
  }

  /**
   * Get default subtitle style
   */
  getDefaultStyle(): SubtitleStyle {
    return {
      fontFamily: 'Arial',
      fontSize: 48,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      position: 'bottom',
      alignment: 'center',
      outline: true,
      shadow: true,
    };
  }

  /**
   * Export subtitles to SRT format
   */
  exportToSRT(subtitles: Subtitle[]): string {
    let srt = '';

    subtitles.forEach((sub, index) => {
      const startTime = this.formatSRTTime(sub.startTime);
      const endTime = this.formatSRTTime(sub.endTime);

      srt += `${index + 1}\n`;
      srt += `${startTime} --> ${endTime}\n`;
      srt += `${sub.text}\n\n`;
    });

    return srt;
  }

  /**
   * Export subtitles to VTT format (WebVTT)
   */
  exportToVTT(subtitles: Subtitle[]): string {
    let vtt = 'WEBVTT\n\n';

    subtitles.forEach((sub) => {
      const startTime = this.formatVTTTime(sub.startTime);
      const endTime = this.formatVTTTime(sub.endTime);

      vtt += `${startTime} --> ${endTime}\n`;
      vtt += `${sub.text}\n\n`;
    });

    return vtt;
  }

  /**
   * Import subtitles from SRT file
   */
  importFromSRT(srtContent: string): Subtitle[] {
    const subtitles: Subtitle[] = [];
    const blocks = srtContent.trim().split('\n\n');

    blocks.forEach((block, index) => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const text = lines.slice(2).join('\n');

        const [startStr, endStr] = timeLine.split(' --> ');
        const startTime = this.parseSRTTime(startStr);
        const endTime = this.parseSRTTime(endStr);

        subtitles.push({
          id: `sub_${index + 1}`,
          startTime,
          endTime,
          text,
        });
      }
    });

    return subtitles;
  }

  /**
   * Format time as SRT timestamp (00:00:00,000)
   */
  private formatSRTTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  }

  /**
   * Format time as VTT timestamp (00:00:00.000)
   */
  private formatVTTTime(ms: number): string {
    return this.formatSRTTime(ms).replace(',', '.');
  }

  /**
   * Parse SRT timestamp to milliseconds
   */
  private parseSRTTime(timeStr: string): number {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);

    return hours * 3600000 + minutes * 60000 + seconds * 1000 + Number(ms || 0);
  }

  /**
   * Generate captions optimized for social media (short, impactful)
   */
  async generateSocialCaptions(subtitles: Subtitle[]): Promise<Subtitle[]> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log('📱 Generating social media optimized captions...');

    try {
      const fullText = subtitles.map((s) => s.text).join(' ');

      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Convert this transcript into short, punchy captions for social media (TikTok/Instagram style):
"${fullText}"

Rules:
- 3-5 words per caption maximum
- Highlight key words/phrases
- Create engagement
- Keep original meaning

Return as JSON array with timing:
[
  {"startTime": 0, "endTime": 2000, "text": "WATCH THIS"},
  ...
]`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const captions = JSON.parse(jsonMatch[0]);
        return captions.map((cap: any, i: number) => ({
          id: `caption_${i + 1}`,
          startTime: cap.startTime,
          endTime: cap.endTime,
          text: cap.text.toUpperCase(), // Social media style
        }));
      }

      return subtitles;
    } catch (error) {
      console.error('Failed to generate social captions:', error);
      return subtitles;
    }
  }

  /**
   * Detect speakers in subtitles (diarization)
   */
  async detectSpeakers(subtitles: Subtitle[]): Promise<Subtitle[]> {
    console.log('👥 Detecting speakers...');

    // In real implementation, use speaker diarization API
    // For now, mock with simple detection

    return subtitles.map((sub, i) => ({
      ...sub,
      speaker: i % 2 === 0 ? 'Speaker 1' : 'Speaker 2',
    }));
  }
}

// Singleton instance
export const subtitleService = SubtitleService.getInstance();
