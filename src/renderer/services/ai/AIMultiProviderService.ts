/**
 * AI Multi-Provider Service - Multiple AIs working together as a team
 */

import { aiProviderService, AIProviderType } from './AIProviderService';

export interface AIRole {
  role: 'creative' | 'technical' | 'compositor' | 'animator' | 'reviewer';
  provider: AIProviderType;
  description: string;
}

export interface CollaborationResult {
  consensus: string;
  providers: {
    provider: AIProviderType;
    response: string;
    confidence: number;
  }[];
  finalDecision: any;
  reasoning: string;
}

/**
 * Multi-AI collaboration system
 * Different AIs specialize in different tasks and work together
 */
class AIMultiProviderService {
  private static instance: AIMultiProviderService;

  // AI Team roles
  private readonly AI_TEAM: Record<string, AIRole> = {
    creative: {
      role: 'creative',
      provider: 'openai', // GPT лучше для креатива
      description: 'Креативный директор - генерирует идеи, стили, концепции',
    },
    technical: {
      role: 'technical',
      provider: 'claude', // Claude лучше для технических задач
      description: 'Технический директор - точные параметры, расчеты, структура',
    },
    compositor: {
      role: 'compositor',
      provider: 'gemini', // Gemini для визуального композитинга
      description: 'Композитор - расположение элементов, компоновка',
    },
    animator: {
      role: 'animator',
      provider: 'openai', // GPT для анимаций
      description: 'Аниматор - движение, эффекты, переходы',
    },
    reviewer: {
      role: 'reviewer',
      provider: 'claude', // Claude для финального ревью
      description: 'Ревьюер - проверка качества, консистентность',
    },
  };

  private constructor() {}

  static getInstance(): AIMultiProviderService {
    if (!AIMultiProviderService.instance) {
      AIMultiProviderService.instance = new AIMultiProviderService();
    }
    return AIMultiProviderService.instance;
  }

  /**
   * Run collaborative task - multiple AIs work together
   */
  async collaborate(
    task: string,
    context: any,
    requiredRoles: AIRole['role'][] = ['creative', 'technical']
  ): Promise<CollaborationResult> {
    console.log(`🤝 Starting AI collaboration: ${requiredRoles.join(', ')}`);

    const results: CollaborationResult['providers'] = [];

    // Each AI provides their perspective
    for (const roleKey of requiredRoles) {
      const role = this.AI_TEAM[roleKey];
      if (!role) continue;

      try {
        const prompt = this.buildRolePrompt(role, task, context);
        const response = await aiProviderService.generateCompletion(prompt, {
          temperature: role.role === 'creative' ? 0.9 : 0.5,
          provider: role.provider,
        });

        results.push({
          provider: role.provider,
          response,
          confidence: this.calculateConfidence(response),
        });

        console.log(`   ${role.provider} (${role.role}): ✅`);
      } catch (error) {
        console.error(`   ${role.provider} failed:`, error);
      }
    }

    // Synthesize final decision
    const finalDecision = await this.synthesizeDecisions(task, results);

    return {
      consensus: finalDecision.explanation,
      providers: results,
      finalDecision: finalDecision.decision,
      reasoning: finalDecision.reasoning,
    };
  }

  /**
   * Generate complex composition with team
   */
  async generateComplexComposition(request: string, context: any) {
    console.log(`🎨 Generating complex composition: "${request}"`);

    // Step 1: Creative Director generates concept
    const creativePrompt = `
Ты креативный директор видеопроизводства.

ЗАДАЧА: ${request}

Придумай визуальную концепцию. Опиши:
1. Общий стиль и настроение
2. Цветовую палитру
3. Ключевые визуальные элементы
4. Анимацию и движение

Формат JSON:
{
  "style": "описание стиля",
  "mood": "настроение",
  "colors": ["#hex1", "#hex2", ...],
  "elements": [
    {"type": "image|text|shape", "description": "...", "position": "..."}
  ],
  "animation": "описание движения"
}`;

    const creativeResponse = await aiProviderService.generateCompletion(creativePrompt, {
      provider: 'openai',
      temperature: 0.9,
    });

    const concept = this.parseJSON(creativeResponse);
    console.log(`   Creative concept:`, concept);

    // Step 2: Technical Director adds precise parameters
    const technicalPrompt = `
Ты технический директор. Вот креативная концепция:
${JSON.stringify(concept, null, 2)}

Добавь точные технические параметры:
1. Размеры и позиции (в пикселях или %)
2. Timing анимаций (в ms)
3. Easing functions
4. Слои и z-index

Формат JSON:
{
  "elements": [
    {
      "id": "element-1",
      "type": "...",
      "position": {"x": 0, "y": 0, "width": 100, "height": 100},
      "animation": {"type": "...", "duration": 1000, "easing": "ease-in-out"},
      "zIndex": 1
    }
  ]
}`;

    const technicalResponse = await aiProviderService.generateCompletion(technicalPrompt, {
      provider: 'claude',
      temperature: 0.3,
    });

    const technical = this.parseJSON(technicalResponse);
    console.log(`   Technical specs:`, technical);

    // Step 3: Compositor arranges layout
    const compositorPrompt = `
Ты композитор. Оптимизируй расположение элементов:
${JSON.stringify(technical, null, 2)}

Улучши:
1. Баланс композиции
2. Правило третей
3. Визуальную иерархию
4. Breathing room (отступы)

Верни улучшенный JSON с финальными позициями.`;

    const compositorResponse = await aiProviderService.generateCompletion(compositorPrompt, {
      provider: 'gemini',
      temperature: 0.5,
    });

    const finalLayout = this.parseJSON(compositorResponse);
    console.log(`   Final layout:`, finalLayout);

    // Step 4: Animator adds motion
    const animatorPrompt = `
Ты аниматор. Добавь анимацию к элементам:
${JSON.stringify(finalLayout, null, 2)}

Создай:
1. Entrance animations (появление)
2. Idle animations (состояние покоя)
3. Exit animations (исчезновение)
4. Микроанимации для интереса

Верни JSON с полным timeline анимаций.`;

    const animatorResponse = await aiProviderService.generateCompletion(animatorPrompt, {
      provider: 'openai',
      temperature: 0.7,
    });

    const withAnimation = this.parseJSON(animatorResponse);

    // Step 5: Reviewer checks quality
    const reviewerPrompt = `
Ты ревьюер качества. Проверь финальную композицию:
${JSON.stringify(withAnimation, null, 2)}

Проверь:
1. Консистентность стиля
2. Читаемость текста
3. Плавность анимаций
4. Accessibility (контраст цветов)

Верни:
{
  "approved": true/false,
  "issues": ["..."],
  "suggestions": ["..."]
}`;

    const reviewerResponse = await aiProviderService.generateCompletion(reviewerPrompt, {
      provider: 'claude',
      temperature: 0.3,
    });

    const review = this.parseJSON(reviewerResponse);

    console.log(`   Review:`, review);

    return {
      concept,
      technical,
      layout: finalLayout,
      animation: withAnimation,
      review,
      approved: review.approved,
    };
  }

  /**
   * Build role-specific prompt
   */
  private buildRolePrompt(role: AIRole, task: string, context: any): string {
    const roleInstructions = {
      creative: 'Ты креативный директор. Думай о визуальном стиле, эмоциях, художественной ценности.',
      technical: 'Ты технический директор. Думай о точных параметрах, производительности, реализации.',
      compositor: 'Ты композитор. Думай о балансе, расположении, визуальной иерархии.',
      animator: 'Ты аниматор. Думай о движении, динамике, плавности переходов.',
      reviewer: 'Ты ревьюер качества. Проверяй консистентность, качество, проблемы.',
    };

    return `
${roleInstructions[role.role]}

ЗАДАЧА: ${task}

КОНТЕКСТ: ${JSON.stringify(context)}

Дай свою профессиональную оценку и рекомендации с точки зрения ${role.role}.
    `;
  }

  /**
   * Synthesize multiple AI responses into final decision
   */
  private async synthesizeDecisions(
    task: string,
    results: CollaborationResult['providers']
  ): Promise<{ decision: any; explanation: string; reasoning: string }> {
    const synthesisPrompt = `
Ты финальный арбитр. Несколько AI дали свои мнения по задаче: "${task}"

МНЕНИЯ:
${results.map((r, i) => `${i + 1}. ${r.provider} (confidence: ${r.confidence}):\n${r.response}`).join('\n\n')}

Создай финальное решение объединяя лучшее от каждого AI.

Верни JSON:
{
  "decision": {...объект с финальным решением...},
  "explanation": "краткое объяснение решения",
  "reasoning": "почему выбрано именно это решение"
}`;

    const synthesis = await aiProviderService.generateCompletion(synthesisPrompt, {
      temperature: 0.5,
    });

    return this.parseJSON(synthesis);
  }

  /**
   * Calculate confidence from response
   */
  private calculateConfidence(response: string): number {
    // Simple heuristic: longer, more detailed responses = higher confidence
    const length = response.length;
    const hasJSON = response.includes('{') && response.includes('}');
    const hasNumbers = /\d+/.test(response);

    let confidence = 0.5;
    if (length > 500) confidence += 0.2;
    if (hasJSON) confidence += 0.2;
    if (hasNumbers) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Parse JSON from AI response
   */
  private parseJSON(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return {};
    }
  }

  /**
   * Get recommended provider for task type
   */
  getRecommendedProvider(taskType: string): AIProviderType {
    const recommendations: Record<string, AIProviderType> = {
      'creative': 'openai', // GPT лучше для креативных задач
      'technical': 'claude', // Claude лучше для технических задач
      'visual': 'gemini', // Gemini для визуального контента
      'animation': 'openai', // GPT для анимаций
      'analysis': 'claude', // Claude для анализа
      'fast': 'gemini', // Gemini быстрее и дешевле
    };

    return recommendations[taskType] || 'claude';
  }
}

export const aiMultiProviderService = AIMultiProviderService.getInstance();
