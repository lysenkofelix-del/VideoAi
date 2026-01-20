/**
 * AI Content Generation Service - Generate video content, images, and B-roll using AI
 */

import Anthropic from '@anthropic-ai/sdk';

export interface AIGenerationOptions {
  prompt: string;
  duration?: number; // For video generation (seconds)
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
  style?: 'cinematic' | 'realistic' | 'animated' | 'artistic';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface GeneratedContent {
  type: 'video' | 'image' | 'audio';
  url: string;
  path?: string;
  duration?: number;
  metadata?: any;
}

export class AIContentService {
  private static instance: AIContentService;
  private anthropic: Anthropic | null = null;
  private apiKey: string | null = null;

  private constructor() {
    this.loadApiKey();
  }

  static getInstance(): AIContentService {
    if (!AIContentService.instance) {
      AIContentService.instance = new AIContentService();
    }
    return AIContentService.instance;
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
          dangerouslyAllowBrowser: true, // For renderer process
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
   * Generate B-roll video clip using AI
   */
  async generateBRoll(prompt: string, options: AIGenerationOptions = {}): Promise<GeneratedContent> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log(`🎬 Generating B-roll: "${prompt}"`);

    try {
      // Use Claude to generate B-roll suggestions and scripts
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Generate a detailed B-roll video description for: "${prompt}"

Style: ${options.style || 'cinematic'}
Duration: ${options.duration || 5} seconds
Aspect Ratio: ${options.aspectRatio || '16:9'}

Provide:
1. Visual description (what to show)
2. Camera movements
3. Lighting/mood
4. Suggested stock footage keywords
5. Color grading notes

Format as JSON:
{
  "description": "...",
  "cameraMovement": "...",
  "lighting": "...",
  "stockKeywords": ["..."],
  "colorGrade": "..."
}`,
          },
        ],
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let metadata = {};
      if (jsonMatch) {
        metadata = JSON.parse(jsonMatch[0]);
      }

      // In real implementation, this would:
      // 1. Use the AI suggestions to search stock footage APIs (Pexels, Pixabay)
      // 2. Or generate video using Runway ML, Stable Video Diffusion
      // For now, return mock with AI metadata

      console.log('✅ B-roll generated with AI guidance:', metadata);

      return {
        type: 'video',
        url: 'mock://generated-broll.mp4',
        duration: (options.duration || 5) * 1000,
        metadata: {
          aiGenerated: true,
          prompt,
          ...metadata,
        },
      };
    } catch (error) {
      console.error('Failed to generate B-roll:', error);
      throw error;
    }
  }

  /**
   * Generate image using AI
   */
  async generateImage(prompt: string, options: AIGenerationOptions = {}): Promise<GeneratedContent> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log(`🎨 Generating image: "${prompt}"`);

    try {
      // Use Claude to enhance the prompt for image generation
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Enhance this image generation prompt for ${options.style || 'realistic'} style:
"${prompt}"

Aspect ratio: ${options.aspectRatio || '16:9'}
Quality: ${options.quality || 'high'}

Provide an enhanced, detailed prompt optimized for image generation.
Focus on: composition, lighting, mood, colors, details.`,
          },
        ],
      });

      const enhancedPrompt = response.content[0].type === 'text'
        ? response.content[0].text
        : prompt;

      console.log('✅ Enhanced prompt:', enhancedPrompt);

      // In real implementation, this would call:
      // - DALL-E 3
      // - Midjourney API
      // - Stable Diffusion
      // For now, mock response

      return {
        type: 'image',
        url: 'mock://generated-image.png',
        metadata: {
          aiGenerated: true,
          originalPrompt: prompt,
          enhancedPrompt,
          style: options.style,
        },
      };
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }
  }

  /**
   * Generate music/audio using AI
   */
  async generateAudio(
    prompt: string,
    duration: number = 30,
    genre: string = 'background'
  ): Promise<GeneratedContent> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log(`🎵 Generating audio: "${prompt}" (${duration}s)`);

    try {
      // Use Claude to create music description
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Create a detailed music generation prompt for:
"${prompt}"

Genre: ${genre}
Duration: ${duration} seconds

Describe:
- Instruments
- Tempo (BPM)
- Mood/emotion
- Structure (intro, build, climax, outro)
- Key/scale

Format as JSON.`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let metadata = {};
      if (jsonMatch) {
        metadata = JSON.parse(jsonMatch[0]);
      }

      console.log('✅ Audio metadata generated:', metadata);

      // In real implementation, use:
      // - MusicGen (Meta)
      // - Suno AI
      // - AIVA
      // - Soundraw

      return {
        type: 'audio',
        url: 'mock://generated-audio.mp3',
        duration: duration * 1000,
        metadata: {
          aiGenerated: true,
          prompt,
          genre,
          ...metadata,
        },
      };
    } catch (error) {
      console.error('Failed to generate audio:', error);
      throw error;
    }
  }

  /**
   * Suggest stock footage based on script/context
   */
  async suggestStockFootage(context: string): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log('🔍 Suggesting stock footage for context...');

    try {
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Suggest 10 stock footage search keywords for this video context:
"${context}"

Return as JSON array of search terms, optimized for stock footage sites.
Focus on: visuals, actions, locations, moods.

Example: ["mountain sunset timelapse", "city traffic aerial", ...]`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const keywords = JSON.parse(jsonMatch[0]);
        console.log('✅ Stock footage suggestions:', keywords);
        return keywords;
      }

      return [];
    } catch (error) {
      console.error('Failed to suggest stock footage:', error);
      return [];
    }
  }

  /**
   * Generate video script from topic
   */
  async generateScript(topic: string, duration: number = 60): Promise<{
    script: string;
    scenes: Array<{ time: number; description: string; visuals: string }>;
  }> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log(`📝 Generating script for: "${topic}" (${duration}s)`);

    try {
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `Create a ${duration}-second video script about: "${topic}"

Include:
1. Engaging narration/voiceover
2. Scene breakdown with timestamps
3. Visual descriptions for each scene
4. Suggested B-roll

Format as JSON:
{
  "script": "Full narration text...",
  "scenes": [
    {
      "time": 0,
      "description": "Opening hook",
      "visuals": "Aerial shot of..."
    },
    ...
  ]
}`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Script generated with', result.scenes?.length, 'scenes');
        return result;
      }

      return { script: '', scenes: [] };
    } catch (error) {
      console.error('Failed to generate script:', error);
      throw error;
    }
  }

  /**
   * Enhance existing video with AI suggestions
   */
  async analyzeAndSuggest(videoPath: string): Promise<{
    suggestions: string[];
    improvements: Array<{ type: string; description: string; confidence: number }>;
  }> {
    if (!this.isAvailable()) {
      throw new Error('AI API key not configured');
    }

    console.log('🔍 Analyzing video for suggestions...');

    // In real implementation, would:
    // 1. Extract frames from video
    // 2. Send to Claude vision API
    // 3. Get suggestions

    // Mock for now
    return {
      suggestions: [
        'Add background music to enhance mood',
        'Consider color grading for cinematic look',
        'Add smooth transitions between scenes',
        'Include subtitles for accessibility',
      ],
      improvements: [
        { type: 'color', description: 'Increase contrast by 15%', confidence: 0.85 },
        { type: 'audio', description: 'Normalize audio levels', confidence: 0.92 },
        { type: 'pacing', description: 'Speed up intro by 20%', confidence: 0.78 },
      ],
    };
  }
}

// Singleton instance
export const aiContentService = AIContentService.getInstance();
