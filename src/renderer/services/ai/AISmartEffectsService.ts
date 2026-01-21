/**
 * AI Smart Effects Service - Intelligent effect application based on context
 */

import { Clip, MediaItem, Effect } from '@shared/types';
import { aiProviderService } from './AIProviderService';

export interface SmartEffectSuggestion {
  type: 'visual' | 'animation' | 'transform' | 'composite';
  effects: Effect[];
  reasoning: string;
}

export interface ProcessingContext {
  mediaType: 'video' | 'image' | 'audio';
  userIntent: string; // "вставь красиво", "сделай профессионально"
  clipDuration: number;
  position: 'intro' | 'middle' | 'outro' | 'overlay';
  previousClips?: Clip[];
  nextClips?: Clip[];
}

/**
 * Smart effects that can be applied automatically
 */
export const SMART_EFFECTS = {
  // Image effects
  roundedCorners: {
    name: 'Закругленные углы',
    type: 'border-radius' as const,
    params: { radius: 20 },
  },
  softShadow: {
    name: 'Мягкая тень',
    type: 'drop-shadow' as const,
    params: { blur: 15, offsetX: 0, offsetY: 10, opacity: 0.3 },
  },
  blurredBackground: {
    name: 'Размытый фон',
    type: 'background-blur' as const,
    params: { blur: 40, scale: 1.2 },
  },

  // Animations
  kenBurns: {
    name: 'Ken Burns эффект',
    type: 'ken-burns' as const,
    params: { startScale: 1, endScale: 1.2, duration: 5000 },
  },
  fadeIn: {
    name: 'Плавное появление',
    type: 'fade-in' as const,
    params: { duration: 1000 },
  },
  fadeOut: {
    name: 'Плавное исчезновение',
    type: 'fade-out' as const,
    params: { duration: 1000 },
  },
  slideIn: {
    name: 'Въезд слева',
    type: 'slide-in' as const,
    params: { direction: 'left', duration: 800 },
  },
  zoomIn: {
    name: 'Приближение',
    type: 'zoom-in' as const,
    params: { startScale: 0.8, endScale: 1, duration: 1000 },
  },

  // Transforms
  centerCrop: {
    name: 'Центрирование и кадрирование',
    type: 'transform' as const,
    params: { scale: 1, x: 0, y: 0 },
  },
  pictureInPicture: {
    name: 'Картинка в картинке',
    type: 'pip' as const,
    params: { scale: 0.3, x: 0.65, y: 0.65 },
  },

  // Compositing
  overlay: {
    name: 'Наложение',
    type: 'overlay' as const,
    params: { opacity: 1, blendMode: 'normal' },
  },
  vignette: {
    name: 'Виньетка',
    type: 'vignette' as const,
    params: { intensity: 0.5 },
  },
};

class AISmartEffectsService {
  private static instance: AISmartEffectsService;

  private constructor() {}

  static getInstance(): AISmartEffectsService {
    if (!AISmartEffectsService.instance) {
      AISmartEffectsService.instance = new AISmartEffectsService();
    }
    return AISmartEffectsService.instance;
  }

  /**
   * Suggest smart effects based on user intent and context
   */
  async suggestEffects(
    context: ProcessingContext
  ): Promise<SmartEffectSuggestion> {
    const { mediaType, userIntent, position, clipDuration } = context;

    // Build prompt for AI
    const prompt = `Ты профессиональный видеомонтажер. Пользователь хочет: "${userIntent}"

Контекст:
- Тип медиа: ${mediaType === 'image' ? 'фотография' : mediaType === 'video' ? 'видео' : 'аудио'}
- Позиция в таймлайне: ${position === 'intro' ? 'начало ролика (интро)' : position === 'outro' ? 'конец ролика (аутро)' : position === 'overlay' ? 'наложение поверх' : 'середина ролика'}
- Длительность клипа: ${(clipDuration / 1000).toFixed(1)} секунд

Доступные эффекты:
1. roundedCorners - закругленные углы (для стильного вида)
2. softShadow - мягкая тень (добавляет глубину)
3. blurredBackground - размытый фон (для изображений 16:9)
4. kenBurns - Ken Burns эффект (медленный зум для фото)
5. fadeIn - плавное появление
6. fadeOut - плавное исчезновение
7. slideIn - въезд слева/справа
8. zoomIn - приближение
9. pictureInPicture - картинка в картинке
10. vignette - виньетка (затемнение краев)

Задача: Выбери 2-4 эффекта которые сделают это профессионально и красиво.
Верни JSON объект:
{
  "effects": ["effect1", "effect2", ...],
  "reasoning": "Почему выбрал эти эффекты"
}

Пример ответа для "вставь фото красиво":
{
  "effects": ["kenBurns", "fadeIn", "fadeOut", "softShadow"],
  "reasoning": "Ken Burns добавит динамику статичному фото, fade in/out сделают плавные переходы, тень добавит глубину"
}`;

    try {
      const response = await aiProviderService.generateCompletion(prompt, {
        temperature: 0.7,
        maxTokens: 500,
      });

      // Parse AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI не вернул валидный JSON');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Convert effect names to Effect objects
      const effects: Effect[] = result.effects.map((effectName: string) => {
        const smartEffect = SMART_EFFECTS[effectName as keyof typeof SMART_EFFECTS];
        if (!smartEffect) {
          console.warn(`Unknown effect: ${effectName}`);
          return null;
        }

        return {
          id: `effect-${Date.now()}-${Math.random()}`,
          type: smartEffect.type,
          name: smartEffect.name,
          enabled: true,
          params: smartEffect.params,
        };
      }).filter(Boolean);

      return {
        type: mediaType === 'image' ? 'visual' : 'animation',
        effects,
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error('AI smart effects error:', error);

      // Fallback: Apply default professional effects
      return this.getDefaultEffects(mediaType, position);
    }
  }

  /**
   * Get default professional effects when AI is unavailable
   */
  private getDefaultEffects(
    mediaType: 'video' | 'image' | 'audio',
    position: ProcessingContext['position']
  ): SmartEffectSuggestion {
    const effects: Effect[] = [];

    if (mediaType === 'image') {
      // Images: Ken Burns + fade in/out + shadow
      effects.push(
        {
          id: `effect-${Date.now()}-1`,
          type: SMART_EFFECTS.kenBurns.type,
          name: SMART_EFFECTS.kenBurns.name,
          enabled: true,
          params: SMART_EFFECTS.kenBurns.params,
        },
        {
          id: `effect-${Date.now()}-2`,
          type: SMART_EFFECTS.fadeIn.type,
          name: SMART_EFFECTS.fadeIn.name,
          enabled: true,
          params: SMART_EFFECTS.fadeIn.params,
        },
        {
          id: `effect-${Date.now()}-3`,
          type: SMART_EFFECTS.fadeOut.type,
          name: SMART_EFFECTS.fadeOut.name,
          enabled: true,
          params: SMART_EFFECTS.fadeOut.params,
        },
        {
          id: `effect-${Date.now()}-4`,
          type: SMART_EFFECTS.softShadow.type,
          name: SMART_EFFECTS.softShadow.name,
          enabled: true,
          params: SMART_EFFECTS.softShadow.params,
        }
      );
    } else if (mediaType === 'video') {
      // Videos: Fade in/out
      if (position === 'intro' || position === 'middle') {
        effects.push({
          id: `effect-${Date.now()}-1`,
          type: SMART_EFFECTS.fadeIn.type,
          name: SMART_EFFECTS.fadeIn.name,
          enabled: true,
          params: SMART_EFFECTS.fadeIn.params,
        });
      }

      if (position === 'outro' || position === 'middle') {
        effects.push({
          id: `effect-${Date.now()}-2`,
          type: SMART_EFFECTS.fadeOut.type,
          name: SMART_EFFECTS.fadeOut.name,
          enabled: true,
          params: SMART_EFFECTS.fadeOut.params,
        });
      }
    }

    return {
      type: mediaType === 'image' ? 'visual' : 'animation',
      effects,
      reasoning: 'Применены стандартные профессиональные эффекты для этого типа медиа',
    };
  }

  /**
   * Apply effects to clip automatically
   */
  async applySmartEffects(
    clip: Clip,
    media: MediaItem,
    context: ProcessingContext
  ): Promise<Clip> {
    const suggestions = await this.suggestEffects(context);

    console.log(`[Smart Effects] Applying to clip ${clip.id}:`);
    console.log(`  - Effects: ${suggestions.effects.map(e => e.name).join(', ')}`);
    console.log(`  - Reasoning: ${suggestions.reasoning}`);

    return {
      ...clip,
      effects: [...(clip.effects || []), ...suggestions.effects],
    };
  }

  /**
   * Generate professional intro/outro with text
   */
  async generateIntroOutro(
    type: 'intro' | 'outro',
    options: {
      title?: string;
      subtitle?: string;
      duration?: number;
      style?: 'minimal' | 'elegant' | 'dynamic' | 'professional';
    }
  ): Promise<{
    effects: Effect[];
    text: { content: string; style: any }[];
  }> {
    const { title, subtitle, duration = 3000, style = 'professional' } = options;

    // Generate text elements
    const text = [];
    if (title) {
      text.push({
        content: title,
        style: {
          fontSize: 72,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          y: 0.4,
        },
      });
    }
    if (subtitle) {
      text.push({
        content: subtitle,
        style: {
          fontSize: 36,
          color: '#cccccc',
          textAlign: 'center',
          y: 0.55,
        },
      });
    }

    // Generate effects based on style
    const effects: Effect[] = [
      {
        id: `effect-intro-${Date.now()}-1`,
        type: 'fade-in' as any,
        name: 'Появление текста',
        enabled: true,
        params: { duration: 800 },
      },
      {
        id: `effect-intro-${Date.now()}-2`,
        type: 'zoom-in' as any,
        name: 'Приближение',
        enabled: true,
        params: { startScale: 0.9, endScale: 1, duration: 1000 },
      },
    ];

    if (type === 'outro') {
      effects.push({
        id: `effect-outro-${Date.now()}-3`,
        type: 'fade-out' as any,
        name: 'Затухание',
        enabled: true,
        params: { duration: 1000 },
      });
    }

    return { effects, text };
  }
}

export const aiSmartEffectsService = AISmartEffectsService.getInstance();
