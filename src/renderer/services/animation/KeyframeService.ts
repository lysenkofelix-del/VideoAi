/**
 * Keyframe Service - Handles keyframe animation for clips
 */

import {
  Clip,
  AnimationKeyframes,
  Keyframe,
  EasingType,
} from '@shared/types';

export class KeyframeService {
  private static instance: KeyframeService;

  private constructor() {}

  static getInstance(): KeyframeService {
    if (!KeyframeService.instance) {
      KeyframeService.instance = new KeyframeService();
    }
    return KeyframeService.instance;
  }

  /**
   * Add animation to clip
   */
  addAnimation(
    clip: Clip,
    property: 'position' | 'scale' | 'rotation' | 'opacity',
    easing: EasingType = 'linear'
  ): AnimationKeyframes {
    // Check if animation already exists
    const existingIndex = clip.animation.findIndex((a) => a.property === property);
    if (existingIndex !== -1) {
      return clip.animation[existingIndex];
    }

    // Create new animation
    const animation: AnimationKeyframes = {
      property,
      keyframes: [],
      easing,
    };

    clip.animation.push(animation);
    console.log(`✅ Added ${property} animation to clip #${clip.mediaNumber}`);
    return animation;
  }

  /**
   * Remove animation from clip
   */
  removeAnimation(clip: Clip, property: 'position' | 'scale' | 'rotation' | 'opacity'): boolean {
    const index = clip.animation.findIndex((a) => a.property === property);
    if (index !== -1) {
      clip.animation.splice(index, 1);
      console.log(`✅ Removed ${property} animation from clip #${clip.mediaNumber}`);
      return true;
    }
    return false;
  }

  /**
   * Add keyframe to animation
   */
  addKeyframe(
    animation: AnimationKeyframes,
    time: number,
    value: number | { x: number; y: number }
  ): Keyframe {
    const keyframe: Keyframe = { time, value };

    // Insert keyframe in sorted position
    const insertIndex = animation.keyframes.findIndex((k) => k.time > time);
    if (insertIndex === -1) {
      animation.keyframes.push(keyframe);
    } else {
      animation.keyframes.splice(insertIndex, 0, keyframe);
    }

    console.log(`✅ Added keyframe at ${time}ms for ${animation.property}`);
    return keyframe;
  }

  /**
   * Remove keyframe from animation
   */
  removeKeyframe(animation: AnimationKeyframes, time: number): boolean {
    const index = animation.keyframes.findIndex((k) => k.time === time);
    if (index !== -1) {
      animation.keyframes.splice(index, 1);
      console.log(`✅ Removed keyframe at ${time}ms for ${animation.property}`);
      return true;
    }
    return false;
  }

  /**
   * Update keyframe value
   */
  updateKeyframe(
    animation: AnimationKeyframes,
    time: number,
    value: number | { x: number; y: number }
  ): boolean {
    const keyframe = animation.keyframes.find((k) => k.time === time);
    if (keyframe) {
      keyframe.value = value;
      return true;
    }
    return false;
  }

  /**
   * Move keyframe to new time
   */
  moveKeyframe(animation: AnimationKeyframes, oldTime: number, newTime: number): boolean {
    const index = animation.keyframes.findIndex((k) => k.time === oldTime);
    if (index !== -1) {
      const keyframe = animation.keyframes[index];
      animation.keyframes.splice(index, 1);
      this.addKeyframe(animation, newTime, keyframe.value);
      return true;
    }
    return false;
  }

  /**
   * Get interpolated value at specific time
   */
  getValueAtTime(animation: AnimationKeyframes, time: number): number | { x: number; y: number } {
    const { keyframes, easing } = animation;

    if (keyframes.length === 0) {
      // Return default values
      if (animation.property === 'position') return { x: 0, y: 0 };
      if (animation.property === 'scale') return { x: 1, y: 1 };
      if (animation.property === 'rotation') return 0;
      if (animation.property === 'opacity') return 1;
      return 0;
    }

    if (keyframes.length === 1) {
      return keyframes[0].value;
    }

    // Find surrounding keyframes
    let beforeKeyframe: Keyframe | null = null;
    let afterKeyframe: Keyframe | null = null;

    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].time <= time) {
        beforeKeyframe = keyframes[i];
      }
      if (keyframes[i].time >= time) {
        afterKeyframe = keyframes[i];
        break;
      }
    }

    // Before first keyframe
    if (!beforeKeyframe && afterKeyframe) {
      return afterKeyframe.value;
    }

    // After last keyframe
    if (beforeKeyframe && !afterKeyframe) {
      return beforeKeyframe.value;
    }

    // Exact match
    if (beforeKeyframe && afterKeyframe && beforeKeyframe.time === time) {
      return beforeKeyframe.value;
    }

    // Interpolate between keyframes
    if (beforeKeyframe && afterKeyframe) {
      const duration = afterKeyframe.time - beforeKeyframe.time;
      const elapsed = time - beforeKeyframe.time;
      const progress = duration > 0 ? elapsed / duration : 0;

      // Apply easing
      const easedProgress = this.applyEasing(progress, easing);

      // Interpolate based on value type
      if (typeof beforeKeyframe.value === 'number' && typeof afterKeyframe.value === 'number') {
        return this.lerp(beforeKeyframe.value, afterKeyframe.value, easedProgress);
      } else if (
        typeof beforeKeyframe.value === 'object' &&
        typeof afterKeyframe.value === 'object'
      ) {
        return {
          x: this.lerp(beforeKeyframe.value.x, afterKeyframe.value.x, easedProgress),
          y: this.lerp(beforeKeyframe.value.y, afterKeyframe.value.y, easedProgress),
        };
      }
    }

    return animation.property === 'position' || animation.property === 'scale'
      ? { x: 0, y: 0 }
      : 0;
  }

  /**
   * Linear interpolation
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(t: number, easing: EasingType): number {
    switch (easing) {
      case 'linear':
        return t;

      case 'easeIn':
        return t * t;

      case 'easeOut':
        return t * (2 - t);

      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      case 'bounce':
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }

      default:
        return t;
    }
  }

  /**
   * Get all animated values for a clip at specific time
   */
  getAnimatedValues(clip: Clip, time: number): {
    position?: { x: number; y: number };
    scale?: { x: number; y: number };
    rotation?: number;
    opacity?: number;
  } {
    const values: any = {};

    clip.animation.forEach((animation) => {
      const value = this.getValueAtTime(animation, time);
      values[animation.property] = value;
    });

    return values;
  }

  /**
   * Copy animation from one clip to another
   */
  copyAnimation(sourceClip: Clip, targetClip: Clip): void {
    targetClip.animation = sourceClip.animation.map((anim) => ({
      property: anim.property,
      keyframes: anim.keyframes.map((kf) => ({ ...kf })),
      easing: anim.easing,
    }));

    console.log(
      `✅ Copied ${sourceClip.animation.length} animations from clip #${sourceClip.mediaNumber} to #${targetClip.mediaNumber}`
    );
  }

  /**
   * Clear all animations from clip
   */
  clearAllAnimations(clip: Clip): void {
    clip.animation = [];
    console.log(`✅ Cleared all animations from clip #${clip.mediaNumber}`);
  }

  /**
   * Get keyframe at specific time (exact match)
   */
  getKeyframeAtTime(animation: AnimationKeyframes, time: number): Keyframe | null {
    return animation.keyframes.find((k) => k.time === time) || null;
  }

  /**
   * Get nearest keyframe to time
   */
  getNearestKeyframe(animation: AnimationKeyframes, time: number, threshold: number = 100): Keyframe | null {
    let nearest: Keyframe | null = null;
    let minDistance = threshold;

    animation.keyframes.forEach((keyframe) => {
      const distance = Math.abs(keyframe.time - time);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = keyframe;
      }
    });

    return nearest;
  }

  /**
   * Create animation preset
   */
  applyPreset(clip: Clip, presetName: string): void {
    switch (presetName) {
      case 'fadeIn':
        {
          const animation = this.addAnimation(clip, 'opacity', 'easeOut');
          this.addKeyframe(animation, 0, 0);
          this.addKeyframe(animation, 500, 1);
        }
        break;

      case 'fadeOut':
        {
          const animation = this.addAnimation(clip, 'opacity', 'easeIn');
          this.addKeyframe(animation, clip.duration - 500, 1);
          this.addKeyframe(animation, clip.duration, 0);
        }
        break;

      case 'zoomIn':
        {
          const animation = this.addAnimation(clip, 'scale', 'easeOut');
          this.addKeyframe(animation, 0, { x: 0.5, y: 0.5 });
          this.addKeyframe(animation, 1000, { x: 1, y: 1 });
        }
        break;

      case 'zoomOut':
        {
          const animation = this.addAnimation(clip, 'scale', 'easeIn');
          this.addKeyframe(animation, clip.duration - 1000, { x: 1, y: 1 });
          this.addKeyframe(animation, clip.duration, { x: 1.5, y: 1.5 });
        }
        break;

      case 'slideInLeft':
        {
          const animation = this.addAnimation(clip, 'position', 'easeOut');
          this.addKeyframe(animation, 0, { x: -1920, y: 0 });
          this.addKeyframe(animation, 800, { x: 0, y: 0 });
        }
        break;

      case 'slideInRight':
        {
          const animation = this.addAnimation(clip, 'position', 'easeOut');
          this.addKeyframe(animation, 0, { x: 1920, y: 0 });
          this.addKeyframe(animation, 800, { x: 0, y: 0 });
        }
        break;

      case 'rotate':
        {
          const animation = this.addAnimation(clip, 'rotation', 'linear');
          this.addKeyframe(animation, 0, 0);
          this.addKeyframe(animation, clip.duration, 360);
        }
        break;

      default:
        console.warn(`Unknown preset: ${presetName}`);
    }

    console.log(`✅ Applied preset "${presetName}" to clip #${clip.mediaNumber}`);
  }
}

// Singleton instance
export const keyframeService = KeyframeService.getInstance();
