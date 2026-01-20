/**
 * AI Transitions Service - Smart transition suggestions based on content analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import { Clip, Transition } from '@shared/types';

export interface TransitionSuggestion {
  type: string;
  duration: number;
  confidence: number;
  reason: string;
}

export class AITransitionsService {
  private static instance: AITransitionsService;
  private anthropic: Anthropic | null = null;
  private apiKey: string | null = null;

  private constructor() {
    this.loadApiKey();
  }

  static getInstance(): AITransitionsService {
    if (!AITransitionsService.instance) {
      AITransitionsService.instance = new AITransitionsService();
    }
    return AITransitionsService.instance;
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
   * Suggest best transition between two clips
   */
  async suggestTransition(
    clip1: Clip,
    clip2: Clip,
    context?: string
  ): Promise<TransitionSuggestion> {
    if (!this.isAvailable()) {
      // Fallback to basic rule-based suggestions
      return this.basicTransitionSuggestion(clip1, clip2);
    }

    console.log(`🔄 AI analyzing transition between clips #${clip1.mediaNumber} and #${clip2.mediaNumber}`);

    try {
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Suggest the best video transition between these two clips:

Clip 1:
- Duration: ${clip1.duration}ms
- Speed: ${clip1.speed}x
- Current effects: ${clip1.effects.map((e) => e.name).join(', ') || 'none'}

Clip 2:
- Duration: ${clip2.duration}ms
- Speed: ${clip2.speed}x
- Current effects: ${clip2.effects.map((e) => e.name).join(', ') || 'none'}

${context ? `Context: ${context}` : ''}

Choose from: dissolve, fade, wipeLeft, wipeRight, wipeUp, wipeDown, slideLeft, slideRight, slideUp, slideDown, circleOpen, circleClose, zoomIn, zoomOut, cut

Consider:
- Pacing and flow
- Content continuity
- Emotional impact
- Professional standards

Return as JSON:
{
  "type": "transition_name",
  "duration": 500,
  "confidence": 0.85,
  "reason": "explanation"
}`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        console.log(`✅ AI suggests: ${suggestion.type} (${suggestion.confidence * 100}% confident)`);
        return suggestion;
      }

      return this.basicTransitionSuggestion(clip1, clip2);
    } catch (error) {
      console.error('Failed to get AI transition suggestion:', error);
      return this.basicTransitionSuggestion(clip1, clip2);
    }
  }

  /**
   * Basic rule-based transition suggestion (fallback)
   */
  private basicTransitionSuggestion(clip1: Clip, clip2: Clip): TransitionSuggestion {
    // Fast clips (sped up) -> quick cut
    if (clip1.speed > 1.5 || clip2.speed > 1.5) {
      return {
        type: 'cut',
        duration: 0,
        confidence: 0.7,
        reason: 'Fast-paced clips work well with quick cuts',
      };
    }

    // Slow clips (slow motion) -> smooth dissolve
    if (clip1.speed < 0.7 || clip2.speed < 0.7) {
      return {
        type: 'dissolve',
        duration: 1000,
        confidence: 0.75,
        reason: 'Slow motion clips benefit from smooth dissolves',
      };
    }

    // Default: medium dissolve
    return {
      type: 'dissolve',
      duration: 500,
      confidence: 0.6,
      reason: 'Standard transition for general use',
    };
  }

  /**
   * Auto-apply transitions to entire timeline
   */
  async autoTransitions(clips: Clip[]): Promise<Map<string, TransitionSuggestion>> {
    console.log(`🎬 Auto-generating transitions for ${clips.length} clips`);

    const suggestions = new Map<string, TransitionSuggestion>();

    for (let i = 0; i < clips.length - 1; i++) {
      const clip1 = clips[i];
      const clip2 = clips[i + 1];

      const suggestion = await this.suggestTransition(clip1, clip2);
      const key = `${clip1.id}_${clip2.id}`;
      suggestions.set(key, suggestion);

      // Throttle to avoid rate limiting
      if (this.isAvailable()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Generated ${suggestions.size} transition suggestions`);
    return suggestions;
  }

  /**
   * Suggest transition based on mood/genre
   */
  suggestByMood(mood: string): TransitionSuggestion {
    const moodMap: Record<string, TransitionSuggestion> = {
      action: {
        type: 'wipeLeft',
        duration: 300,
        confidence: 0.8,
        reason: 'Fast wipes maintain energy in action sequences',
      },
      dramatic: {
        type: 'fade',
        duration: 1500,
        confidence: 0.85,
        reason: 'Slow fades enhance dramatic tension',
      },
      romantic: {
        type: 'dissolve',
        duration: 1000,
        confidence: 0.9,
        reason: 'Smooth dissolves create romantic flow',
      },
      comedy: {
        type: 'cut',
        duration: 0,
        confidence: 0.75,
        reason: 'Quick cuts work well for comedic timing',
      },
      horror: {
        type: 'circleClose',
        duration: 800,
        confidence: 0.8,
        reason: 'Circle transitions create suspense',
      },
      documentary: {
        type: 'dissolve',
        duration: 500,
        confidence: 0.85,
        reason: 'Dissolves maintain professional documentary feel',
      },
      vlog: {
        type: 'slideRight',
        duration: 400,
        confidence: 0.7,
        reason: 'Slides are popular in vlog editing',
      },
      music: {
        type: 'zoomIn',
        duration: 600,
        confidence: 0.75,
        reason: 'Dynamic zooms match music energy',
      },
    };

    return (
      moodMap[mood.toLowerCase()] || {
        type: 'dissolve',
        duration: 500,
        confidence: 0.6,
        reason: 'Default professional transition',
      }
    );
  }

  /**
   * Match transition to beat/music
   */
  async syncTransitionToMusic(
    beatTimestamps: number[],
    clipTransitions: Array<{ clip1: Clip; clip2: Clip }>
  ): Promise<TransitionSuggestion[]> {
    console.log('🎵 Syncing transitions to music beats...');

    return clipTransitions.map((pair, index) => {
      // Find nearest beat to transition point
      const transitionTime = pair.clip1.startTime + pair.clip1.duration;
      const nearestBeat = this.findNearestBeat(transitionTime, beatTimestamps);

      const onBeat = Math.abs(transitionTime - nearestBeat) < 100; // Within 100ms

      if (onBeat) {
        return {
          type: 'zoomIn',
          duration: 300,
          confidence: 0.9,
          reason: 'Synced to music beat for impact',
        };
      } else {
        return {
          type: 'dissolve',
          duration: 500,
          confidence: 0.7,
          reason: 'Smooth transition between beats',
        };
      }
    });
  }

  /**
   * Find nearest beat timestamp
   */
  private findNearestBeat(time: number, beats: number[]): number {
    return beats.reduce((nearest, beat) => {
      return Math.abs(beat - time) < Math.abs(nearest - time) ? beat : nearest;
    }, beats[0] || time);
  }

  /**
   * Analyze video content and suggest transitions
   */
  async analyzeContentForTransitions(
    clips: Clip[]
  ): Promise<
    Array<{
      clipIndex: number;
      contentType: string;
      suggestedTransition: TransitionSuggestion;
    }>
  > {
    console.log('🔍 Analyzing clip content for transition suggestions...');

    // In real implementation, would analyze:
    // - Scene changes (indoor/outdoor, day/night)
    // - Motion patterns (static to dynamic)
    // - Color shifts
    // - Audio changes

    // Mock analysis
    return clips.map((clip, index) => ({
      clipIndex: index,
      contentType: this.mockContentType(clip),
      suggestedTransition: this.suggestByMood('documentary'),
    }));
  }

  /**
   * Mock content type detection
   */
  private mockContentType(clip: Clip): string {
    const types = ['talking head', 'b-roll', 'title', 'action', 'landscape'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get all available transitions
   */
  getAvailableTransitions(): Array<{
    type: string;
    name: string;
    description: string;
    preview?: string;
  }> {
    return [
      {
        type: 'cut',
        name: 'Cut',
        description: 'Instant transition, no effect',
      },
      {
        type: 'dissolve',
        name: 'Cross Dissolve',
        description: 'Smooth blend between clips',
      },
      {
        type: 'fade',
        name: 'Fade to Black',
        description: 'Fade out then fade in',
      },
      {
        type: 'wipeLeft',
        name: 'Wipe Left',
        description: 'New clip wipes from left',
      },
      {
        type: 'wipeRight',
        name: 'Wipe Right',
        description: 'New clip wipes from right',
      },
      {
        type: 'wipeUp',
        name: 'Wipe Up',
        description: 'New clip wipes upward',
      },
      {
        type: 'wipeDown',
        name: 'Wipe Down',
        description: 'New clip wipes downward',
      },
      {
        type: 'slideLeft',
        name: 'Slide Left',
        description: 'Slides to reveal new clip',
      },
      {
        type: 'slideRight',
        name: 'Slide Right',
        description: 'Slides to reveal new clip',
      },
      {
        type: 'circleOpen',
        name: 'Circle Open',
        description: 'Circular reveal',
      },
      {
        type: 'circleClose',
        name: 'Circle Close',
        description: 'Circular close',
      },
      {
        type: 'zoomIn',
        name: 'Zoom In',
        description: 'Zoom into new clip',
      },
      {
        type: 'zoomOut',
        name: 'Zoom Out',
        description: 'Zoom out to new clip',
      },
    ];
  }
}

// Singleton instance
export const aiTransitionsService = AITransitionsService.getInstance();
