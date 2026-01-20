/**
 * AI Command Executor - Executes AI commands on timeline
 */

import { AICommand } from '@shared/types';
import { useTimelineStore } from '../../stores/timelineStore';
import { useMediaStore } from '../../stores/mediaStore';
import { effectService } from '../effects/EffectService';
import { keyframeService } from '../animation/KeyframeService';
import { subtitleService } from './SubtitleService';
import { aiTransitionsService } from './AITransitionsService';
import { aiContentService } from './AIContentService';

export interface ExecutionResult {
  success: boolean;
  message: string;
  affectedClips?: string[];
  errors?: string[];
}

export class AICommandExecutor {
  private static instance: AICommandExecutor;

  private constructor() {}

  static getInstance(): AICommandExecutor {
    if (!AICommandExecutor.instance) {
      AICommandExecutor.instance = new AICommandExecutor();
    }
    return AICommandExecutor.instance;
  }

  /**
   * Execute AI commands
   */
  async executeCommands(commands: AICommand[]): Promise<ExecutionResult> {
    console.log(`🤖 Executing ${commands.length} AI commands...`);

    const results: ExecutionResult[] = [];
    const affectedClips: string[] = [];
    const errors: string[] = [];

    for (const command of commands) {
      try {
        const result = await this.executeCommand(command);
        results.push(result);

        if (result.success && result.affectedClips) {
          affectedClips.push(...result.affectedClips);
        }

        if (!result.success && result.errors) {
          errors.push(...result.errors);
        }
      } catch (error) {
        console.error('Command execution failed:', error);
        errors.push(`Failed to execute ${command.type}: ${error}`);
      }
    }

    const allSuccess = results.every((r) => r.success);

    return {
      success: allSuccess,
      message: allSuccess
        ? `✅ Successfully executed ${commands.length} commands`
        : `⚠️ Completed with ${errors.length} errors`,
      affectedClips: [...new Set(affectedClips)],
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Execute single command
   */
  private async executeCommand(command: AICommand): Promise<ExecutionResult> {
    console.log(`🎬 Executing: ${command.type}`, command.mediaReferences);

    switch (command.type) {
      case 'insert':
        return this.executeInsert(command);

      case 'delete':
        return this.executeDelete(command);

      case 'move':
        return this.executeMove(command);

      case 'trim':
        return this.executeTrim(command);

      case 'effect':
        return this.executeEffect(command);

      case 'transition':
        return this.executeTransition(command);

      case 'generate_broll':
        return this.executeGenerateBRoll(command);

      case 'generate_subtitles':
        return this.executeGenerateSubtitles(command);

      case 'generate_music':
        return this.executeGenerateMusic(command);

      case 'auto_edit':
        return this.executeAutoEdit(command);

      default:
        return {
          success: false,
          message: `Unknown command type: ${command.type}`,
          errors: [`Unknown command: ${command.type}`],
        };
    }
  }

  /**
   * Execute INSERT command
   */
  private async executeInsert(command: AICommand): Promise<ExecutionResult> {
    const { addClip } = useTimelineStore.getState();
    const { getMediaByNumber } = useMediaStore.getState();

    const insertedClips: string[] = [];

    for (const mediaNumber of command.mediaReferences) {
      const media = getMediaByNumber(mediaNumber);
      if (!media) {
        return {
          success: false,
          message: `Media #${mediaNumber} not found`,
          errors: [`Media #${mediaNumber} does not exist`],
        };
      }

      const position = command.parameters.position || 0;
      const trackId = command.parameters.trackId || 'video-1';

      const clip = addClip({
        mediaId: media.id,
        mediaNumber: media.displayNumber,
        trackId,
        startTime: position,
        duration: media.duration || 5000,
        inPoint: 0,
        outPoint: media.duration || 5000,
      });

      insertedClips.push(clip.id);
    }

    return {
      success: true,
      message: `Inserted ${insertedClips.length} clips`,
      affectedClips: insertedClips,
    };
  }

  /**
   * Execute DELETE command
   */
  private async executeDelete(command: AICommand): Promise<ExecutionResult> {
    const { tracks, removeClip } = useTimelineStore.getState();

    const deletedClips: string[] = [];

    for (const mediaNumber of command.mediaReferences) {
      // Find all clips with this media number
      for (const track of tracks) {
        for (const clip of track.clips) {
          if (clip.mediaNumber === mediaNumber) {
            removeClip(clip.id);
            deletedClips.push(clip.id);
          }
        }
      }
    }

    return {
      success: true,
      message: `Deleted ${deletedClips.length} clips`,
      affectedClips: deletedClips,
    };
  }

  /**
   * Execute MOVE command
   */
  private async executeMove(command: AICommand): Promise<ExecutionResult> {
    const { tracks, updateClip } = useTimelineStore.getState();

    const movedClips: string[] = [];
    const newPosition = command.parameters.position || 0;

    for (const mediaNumber of command.mediaReferences) {
      for (const track of tracks) {
        const clip = track.clips.find((c) => c.mediaNumber === mediaNumber);
        if (clip) {
          updateClip(clip.id, { startTime: newPosition });
          movedClips.push(clip.id);
        }
      }
    }

    return {
      success: true,
      message: `Moved ${movedClips.length} clips to ${newPosition}ms`,
      affectedClips: movedClips,
    };
  }

  /**
   * Execute TRIM command
   */
  private async executeTrim(command: AICommand): Promise<ExecutionResult> {
    const { tracks, updateClip } = useTimelineStore.getState();

    const trimmedClips: string[] = [];
    const { inPoint, outPoint } = command.parameters;

    for (const mediaNumber of command.mediaReferences) {
      for (const track of tracks) {
        const clip = track.clips.find((c) => c.mediaNumber === mediaNumber);
        if (clip) {
          const updates: any = {};
          if (inPoint !== undefined) updates.inPoint = inPoint;
          if (outPoint !== undefined) updates.outPoint = outPoint;
          if (inPoint !== undefined && outPoint !== undefined) {
            updates.duration = outPoint - inPoint;
          }

          updateClip(clip.id, updates);
          trimmedClips.push(clip.id);
        }
      }
    }

    return {
      success: true,
      message: `Trimmed ${trimmedClips.length} clips`,
      affectedClips: trimmedClips,
    };
  }

  /**
   * Execute EFFECT command
   */
  private async executeEffect(command: AICommand): Promise<ExecutionResult> {
    const { tracks } = useTimelineStore.getState();

    const affectedClips: string[] = [];
    const effectType = command.parameters.effectType || 'lumetri';
    const effectName = command.parameters.effectName || 'Lumetri Color';

    for (const mediaNumber of command.mediaReferences) {
      for (const track of tracks) {
        const clip = track.clips.find((c) => c.mediaNumber === mediaNumber);
        if (clip) {
          effectService.addEffectToClip(clip, effectType, effectName);

          // Apply parameters if specified
          if (command.parameters.effectParams) {
            const effect = clip.effects[clip.effects.length - 1];
            Object.entries(command.parameters.effectParams).forEach(([key, value]) => {
              effectService.updateEffectParameter(clip, effect.id, key, value);
            });
          }

          affectedClips.push(clip.id);
        }
      }
    }

    return {
      success: true,
      message: `Applied ${effectName} to ${affectedClips.length} clips`,
      affectedClips,
    };
  }

  /**
   * Execute TRANSITION command
   */
  private async executeTransition(command: AICommand): Promise<ExecutionResult> {
    const { tracks } = useTimelineStore.getState();

    if (command.mediaReferences.length < 2) {
      return {
        success: false,
        message: 'Transition requires at least 2 clips',
        errors: ['Need 2+ media references for transition'],
      };
    }

    const affectedClips: string[] = [];

    // Get AI suggestion for transition if not specified
    let transitionType = command.parameters.type || 'dissolve';
    let duration = command.parameters.duration || 500;

    if (command.parameters.aiSuggest !== false) {
      // Find clips
      const clip1 = tracks
        .flatMap((t) => t.clips)
        .find((c) => c.mediaNumber === command.mediaReferences[0]);
      const clip2 = tracks
        .flatMap((t) => t.clips)
        .find((c) => c.mediaNumber === command.mediaReferences[1]);

      if (clip1 && clip2) {
        const suggestion = await aiTransitionsService.suggestTransition(clip1, clip2);
        transitionType = suggestion.type;
        duration = suggestion.duration;
        console.log(`🤖 AI suggested: ${transitionType} (${duration}ms)`);
      }
    }

    // Apply transition
    for (let i = 0; i < command.mediaReferences.length - 1; i++) {
      const mediaNum1 = command.mediaReferences[i];
      const mediaNum2 = command.mediaReferences[i + 1];

      const clip1 = tracks.flatMap((t) => t.clips).find((c) => c.mediaNumber === mediaNum1);
      const clip2 = tracks.flatMap((t) => t.clips).find((c) => c.mediaNumber === mediaNum2);

      if (clip1 && clip2) {
        effectService.addTransition(clip1, clip2, transitionType, duration);
        affectedClips.push(clip1.id, clip2.id);
      }
    }

    return {
      success: true,
      message: `Applied ${transitionType} transitions`,
      affectedClips,
    };
  }

  /**
   * Execute GENERATE_BROLL command
   */
  private async executeGenerateBRoll(command: AICommand): Promise<ExecutionResult> {
    const prompt = command.parameters.prompt || 'cinematic B-roll footage';
    const duration = command.parameters.duration || 5;

    console.log(`🎬 Generating B-roll: "${prompt}"`);

    const generated = await aiContentService.generateBRoll(prompt, {
      duration,
      style: command.parameters.style || 'cinematic',
      aspectRatio: command.parameters.aspectRatio || '16:9',
    });

    // TODO: Add generated content to media pool
    console.log('✅ B-roll generated:', generated);

    return {
      success: true,
      message: `Generated B-roll: ${prompt}`,
    };
  }

  /**
   * Execute GENERATE_SUBTITLES command
   */
  private async executeGenerateSubtitles(command: AICommand): Promise<ExecutionResult> {
    const { tracks } = useTimelineStore.getState();

    const affectedClips: string[] = [];

    for (const mediaNumber of command.mediaReferences) {
      const clip = tracks.flatMap((t) => t.clips).find((c) => c.mediaNumber === mediaNumber);

      if (clip) {
        // Generate subtitles for clip
        const result = await subtitleService.generateSubtitles(
          `mock://clip-${clip.id}`,
          command.parameters.language || 'auto'
        );

        // Add to clip
        subtitleService.addSubtitlesToClip(clip, result.subtitles);
        affectedClips.push(clip.id);

        console.log(`✅ Generated ${result.subtitles.length} subtitles for clip #${mediaNumber}`);
      }
    }

    return {
      success: true,
      message: `Generated subtitles for ${affectedClips.length} clips`,
      affectedClips,
    };
  }

  /**
   * Execute GENERATE_MUSIC command
   */
  private async executeGenerateMusic(command: AICommand): Promise<ExecutionResult> {
    const prompt = command.parameters.prompt || 'background music';
    const duration = command.parameters.duration || 30;
    const genre = command.parameters.genre || 'background';

    console.log(`🎵 Generating music: "${prompt}"`);

    const generated = await aiContentService.generateAudio(prompt, duration, genre);

    // TODO: Add to media pool and timeline
    console.log('✅ Music generated:', generated);

    return {
      success: true,
      message: `Generated ${duration}s of ${genre} music`,
    };
  }

  /**
   * Execute AUTO_EDIT command
   */
  private async executeAutoEdit(command: AICommand): Promise<ExecutionResult> {
    const { tracks } = useTimelineStore.getState();

    console.log('🤖 Running auto-edit...');

    // Auto-apply transitions
    const clips = tracks.flatMap((t) => t.clips).sort((a, b) => a.startTime - b.startTime);

    if (command.parameters.transitions !== false) {
      await aiTransitionsService.autoTransitions(clips);
    }

    // Auto-apply animation presets
    if (command.parameters.animations !== false) {
      clips.forEach((clip, i) => {
        if (i === 0) {
          // First clip: fade in
          keyframeService.applyPreset(clip, 'fadeIn');
        } else if (i === clips.length - 1) {
          // Last clip: fade out
          keyframeService.applyPreset(clip, 'fadeOut');
        }
      });
    }

    return {
      success: true,
      message: 'Auto-edit complete',
      affectedClips: clips.map((c) => c.id),
    };
  }
}

// Singleton instance
export const aiCommandExecutor = AICommandExecutor.getInstance();
