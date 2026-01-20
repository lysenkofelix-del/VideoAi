/**
 * Effect Service - Handles applying effects to clips
 */

import { Clip, Effect, Transition } from '@shared/types';
import { ffmpegService } from '../video/FFmpegService';

export interface EffectPreset {
  id: string;
  name: string;
  category: string;
  parameters: Record<string, any>;
}

export class EffectService {
  private static instance: EffectService;

  private constructor() {}

  static getInstance(): EffectService {
    if (!EffectService.instance) {
      EffectService.instance = new EffectService();
    }
    return EffectService.instance;
  }

  /**
   * Add effect to clip
   */
  addEffectToClip(clip: Clip, effectType: string, effectName: string): Effect {
    const effect: Effect = {
      id: `effect_${Date.now()}`,
      type: effectType,
      name: effectName,
      enabled: true,
      parameters: this.getDefaultParameters(effectType),
    };

    clip.effects.push(effect);
    console.log(`✅ Added effect "${effectName}" to clip #${clip.mediaNumber}`);
    return effect;
  }

  /**
   * Remove effect from clip
   */
  removeEffectFromClip(clip: Clip, effectId: string): boolean {
    const index = clip.effects.findIndex((e) => e.id === effectId);
    if (index !== -1) {
      clip.effects.splice(index, 1);
      console.log(`✅ Removed effect from clip #${clip.mediaNumber}`);
      return true;
    }
    return false;
  }

  /**
   * Toggle effect enabled/disabled
   */
  toggleEffect(clip: Clip, effectId: string): boolean {
    const effect = clip.effects.find((e) => e.id === effectId);
    if (effect) {
      effect.enabled = !effect.enabled;
      return effect.enabled;
    }
    return false;
  }

  /**
   * Update effect parameter
   */
  updateEffectParameter(clip: Clip, effectId: string, paramName: string, value: any): void {
    const effect = clip.effects.find((e) => e.id === effectId);
    if (effect) {
      effect.parameters[paramName] = value;
    }
  }

  /**
   * Get default parameters for effect type
   */
  private getDefaultParameters(effectType: string): Record<string, any> {
    switch (effectType) {
      case 'lumetri':
        return {
          exposure: 0,
          contrast: 0,
          highlights: 0,
          shadows: 0,
          whites: 0,
          blacks: 0,
          temperature: 0,
          tint: 0,
          saturation: 0,
          vibrance: 0,
        };

      case 'brightness':
        return {
          brightness: 0,
          contrast: 0,
        };

      case 'hue_saturation':
        return {
          hue: 0,
          saturation: 0,
          lightness: 0,
        };

      case 'gaussian_blur':
        return {
          radius: 5,
        };

      case 'sharpen':
        return {
          amount: 1.0,
        };

      case 'transform':
        return {
          position: { x: 0, y: 0 },
          scale: { x: 100, y: 100 },
          rotation: 0,
          anchor: { x: 50, y: 50 },
        };

      case 'crop':
        return {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        };

      case 'ultra_key':
        return {
          keyColor: '#00ff00',
          similarity: 0.3,
          blend: 0.1,
          spillSuppression: 0,
        };

      // AI Effects
      case 'ai_background_remove':
        return {
          strength: 1.0,
          feather: 5,
        };

      case 'ai_upscale':
        return {
          scale: 2,
          denoise: 0.5,
        };

      case 'ai_stabilize':
        return {
          smoothness: 0.7,
          cropToFit: true,
        };

      default:
        return {};
    }
  }

  /**
   * Apply effect to video file (for export)
   */
  async applyEffectToFile(
    clip: Clip,
    effect: Effect,
    inputPath: string,
    outputPath: string
  ): Promise<string> {
    if (!effect.enabled) {
      return inputPath; // Skip disabled effects
    }

    try {
      return await ffmpegService.applyEffect(clip, effect, outputPath);
    } catch (error) {
      console.error(`Failed to apply effect ${effect.name}:`, error);
      return inputPath;
    }
  }

  /**
   * Apply all effects to a clip (for export)
   */
  async applyAllEffects(
    clip: Clip,
    inputPath: string,
    tempDir: string
  ): Promise<string> {
    let currentPath = inputPath;
    const enabledEffects = clip.effects.filter((e) => e.enabled);

    for (let i = 0; i < enabledEffects.length; i++) {
      const effect = enabledEffects[i];
      const outputPath = `${tempDir}/effect_${i}_${effect.id}.mp4`;

      currentPath = await this.applyEffectToFile(clip, effect, currentPath, outputPath);
    }

    return currentPath;
  }

  /**
   * Get effect presets
   */
  getPresets(effectType: string): EffectPreset[] {
    switch (effectType) {
      case 'lumetri':
        return [
          {
            id: 'warm',
            name: 'Warm Tone',
            category: 'Color Grading',
            parameters: {
              temperature: 10,
              saturation: 5,
              vibrance: 10,
            },
          },
          {
            id: 'cool',
            name: 'Cool Tone',
            category: 'Color Grading',
            parameters: {
              temperature: -10,
              tint: 5,
              saturation: -5,
            },
          },
          {
            id: 'cinematic',
            name: 'Cinematic',
            category: 'Color Grading',
            parameters: {
              contrast: 15,
              shadows: -10,
              highlights: -5,
              saturation: -10,
            },
          },
          {
            id: 'vintage',
            name: 'Vintage',
            category: 'Color Grading',
            parameters: {
              temperature: 5,
              saturation: -15,
              vibrance: -10,
              contrast: -5,
            },
          },
        ];

      case 'gaussian_blur':
        return [
          { id: 'light', name: 'Light Blur', category: 'Blur', parameters: { radius: 3 } },
          { id: 'medium', name: 'Medium Blur', category: 'Blur', parameters: { radius: 10 } },
          { id: 'heavy', name: 'Heavy Blur', category: 'Blur', parameters: { radius: 25 } },
        ];

      default:
        return [];
    }
  }

  /**
   * Apply preset to effect
   */
  applyPreset(effect: Effect, preset: EffectPreset): void {
    effect.parameters = { ...effect.parameters, ...preset.parameters };
    console.log(`✅ Applied preset "${preset.name}" to effect "${effect.name}"`);
  }

  /**
   * Add transition between two clips
   */
  addTransition(clip1: Clip, clip2: Clip, transitionType: string, duration: number): Transition {
    const transition: Transition = {
      id: `transition_${Date.now()}`,
      type: transitionType,
      duration: duration,
      parameters: {},
    };

    // Add transition to end of clip1
    clip1.transitions.out = transition;

    // Add transition to start of clip2
    clip2.transitions.in = transition;

    console.log(
      `✅ Added ${transitionType} transition (${duration}ms) between clips #${clip1.mediaNumber} and #${clip2.mediaNumber}`
    );

    return transition;
  }

  /**
   * Remove transition
   */
  removeTransition(clip: Clip, position: 'in' | 'out'): void {
    if (position === 'in') {
      clip.transitions.in = undefined;
    } else {
      clip.transitions.out = undefined;
    }
  }

  /**
   * Process AI effect (requires Claude API)
   */
  async processAIEffect(
    clip: Clip,
    effect: Effect,
    inputPath: string,
    outputPath: string
  ): Promise<string> {
    console.log(`🤖 Processing AI effect: ${effect.name}`);

    // Check if AI is available
    const settings = localStorage.getItem('app-settings');
    const hasAPIKey = settings && JSON.parse(settings).claudeApiKey;

    if (!hasAPIKey) {
      console.warn('⚠️ AI effects require Claude API key');
      return inputPath;
    }

    // Mock AI processing for now
    // In real implementation, this would call specific AI services
    switch (effect.type) {
      case 'ai_background_remove':
        console.log('  Using AI to remove background...');
        break;

      case 'ai_upscale':
        console.log('  Using AI to upscale video...');
        break;

      case 'ai_stabilize':
        console.log('  Using AI to stabilize footage...');
        break;

      case 'ai_denoise':
        console.log('  Using AI to reduce noise...');
        break;

      default:
        console.log('  Unknown AI effect');
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('✅ AI effect processed');
    return outputPath;
  }
}

// Singleton instance
export const effectService = EffectService.getInstance();
