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
 * Supports 1-4 AIs with intelligent role redistribution
 */
class AIMultiProviderService {
  private static instance: AIMultiProviderService;

  // Default AI Team roles (when all 4 AIs are available)
  private readonly DEFAULT_AI_TEAM: Record<string, AIRole> = {
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

  // Current active team (dynamically assigned based on available AIs)
  private AI_TEAM: Record<string, AIRole> = {};

  private constructor() {
    this.initializeTeam();
  }

  static getInstance(): AIMultiProviderService {
    if (!AIMultiProviderService.instance) {
      AIMultiProviderService.instance = new AIMultiProviderService();
    }
    return AIMultiProviderService.instance;
  }

  /**
   * Initialize AI team based on available providers
   * Intelligently distributes roles when only 3/4, 2/4, or 1/4 AIs are available
   */
  private initializeTeam(): void {
    const availableProviders = aiProviderService.getAvailableProviders();
    console.log(`🤖 Available AI providers: ${availableProviders.join(', ')}`);

    if (availableProviders.length === 0) {
      console.warn('⚠️ No AI providers available');
      return;
    }

    // Case 1: All 4 AIs available (optimal)
    if (availableProviders.length === 4) {
      this.AI_TEAM = { ...this.DEFAULT_AI_TEAM };
      console.log('✅ Full AI team (4/4) - optimal configuration');
      return;
    }

    // Case 2: 3 AIs available - redistribute roles
    if (availableProviders.length === 3) {
      this.AI_TEAM = this.assignRolesFor3AIs(availableProviders);
      console.log(`✅ AI team (3/4) - redistributed roles among ${availableProviders.join(', ')}`);
      return;
    }

    // Case 3: 2 AIs available - essential roles only
    if (availableProviders.length === 2) {
      this.AI_TEAM = this.assignRolesFor2AIs(availableProviders);
      console.log(`✅ AI team (2/4) - essential roles with ${availableProviders.join(', ')}`);
      return;
    }

    // Case 4: 1 AI available - single AI handles all roles
    if (availableProviders.length === 1) {
      this.AI_TEAM = this.assignRolesFor1AI(availableProviders[0]);
      console.log(`✅ AI team (1/4) - ${availableProviders[0]} handles all roles`);
      return;
    }
  }

  /**
   * Assign roles when 3 AIs are available
   */
  private assignRolesFor3AIs(providers: AIProviderType[]): Record<string, AIRole> {
    const team: Record<string, AIRole> = {};

    // Determine which AI is missing
    const hasClaude = providers.includes('claude');
    const hasOpenAI = providers.includes('openai');
    const hasGemini = providers.includes('gemini');
    const hasSora2 = providers.includes('sora2');

    if (!hasClaude) {
      // Missing Claude - OpenAI takes technical & reviewer roles
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: 'openai' };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: 'openai' };
      team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider: 'gemini' };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: hasOpenAI ? 'openai' : 'sora2' };
      team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider: 'openai' };
    } else if (!hasOpenAI) {
      // Missing OpenAI - Claude takes creative & animator roles
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: 'claude' };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: 'claude' };
      team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider: 'gemini' };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: hasSora2 ? 'sora2' : 'claude' };
      team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider: 'claude' };
    } else if (!hasGemini) {
      // Missing Gemini - Claude takes compositor role
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: 'openai' };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: 'claude' };
      team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider: 'claude' };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: hasOpenAI ? 'openai' : 'sora2' };
      team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider: 'claude' };
    } else if (!hasSora2) {
      // Missing Sora2 - use default team (Sora2 was optional for video generation)
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: 'openai' };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: 'claude' };
      team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider: 'gemini' };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: 'openai' };
      team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider: 'claude' };
    }

    return team;
  }

  /**
   * Assign roles when 2 AIs are available
   */
  private assignRolesFor2AIs(providers: AIProviderType[]): Record<string, AIRole> {
    const team: Record<string, AIRole> = {};
    const [ai1, ai2] = providers;

    // Best combinations:
    // Claude + OpenAI = ideal (technical + creative)
    // Claude + Gemini = good (technical + visual)
    // OpenAI + Gemini = decent (creative + visual)

    if (providers.includes('claude') && providers.includes('openai')) {
      // Optimal 2-AI setup
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: 'openai' };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: 'claude' };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: 'openai' };
      team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider: 'claude' };
    } else if (providers.includes('claude')) {
      // Claude + another AI
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: 'claude' };
      team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider: 'claude' };
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: ai1 === 'claude' ? ai2 : ai1 };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: ai1 === 'claude' ? ai2 : ai1 };
    } else if (providers.includes('openai')) {
      // OpenAI + another AI (not Claude)
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: 'openai' };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: 'openai' };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: ai1 === 'openai' ? ai2 : ai1 };
      team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider: ai1 === 'openai' ? ai2 : ai1 };
    } else {
      // Other combinations (Gemini + Sora2, etc.)
      team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider: ai1 };
      team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider: ai1 };
      team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider: ai2 };
      team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider: ai2 };
    }

    return team;
  }

  /**
   * Assign roles when only 1 AI is available
   */
  private assignRolesFor1AI(provider: AIProviderType): Record<string, AIRole> {
    const team: Record<string, AIRole> = {};

    // Single AI handles all roles
    team.creative = { ...this.DEFAULT_AI_TEAM.creative, provider };
    team.technical = { ...this.DEFAULT_AI_TEAM.technical, provider };
    team.compositor = { ...this.DEFAULT_AI_TEAM.compositor, provider };
    team.animator = { ...this.DEFAULT_AI_TEAM.animator, provider };
    team.reviewer = { ...this.DEFAULT_AI_TEAM.reviewer, provider };

    return team;
  }

  /**
   * Reinitialize team (call this when AI providers change)
   */
  reinitializeTeam(): void {
    this.initializeTeam();
  }

  /**
   * Run collaborative task - multiple AIs work together
   */
  async collaborate(
    task: string,
    context: any,
    requiredRoles: AIRole['role'][] = ['creative', 'technical']
  ): Promise<CollaborationResult> {
    // Reinitialize team in case settings changed
    this.initializeTeam();

    console.log(`🤝 Starting AI collaboration: ${requiredRoles.join(', ')}`);

    const results: CollaborationResult['providers'] = [];

    // Each AI provides their perspective
    for (const roleKey of requiredRoles) {
      const role = this.AI_TEAM[roleKey];
      if (!role) {
        console.warn(`⚠️ Role '${roleKey}' not assigned in current team`);
        continue;
      }

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
    // Reinitialize team in case settings changed
    this.initializeTeam();

    console.log(`🎨 Generating complex composition: "${request}"`);

    // Get assigned providers for each role
    const creativeProvider = this.AI_TEAM.creative?.provider || 'openai';
    const technicalProvider = this.AI_TEAM.technical?.provider || 'claude';
    const compositorProvider = this.AI_TEAM.compositor?.provider || 'gemini';
    const animatorProvider = this.AI_TEAM.animator?.provider || 'openai';
    const reviewerProvider = this.AI_TEAM.reviewer?.provider || 'claude';

    console.log(`📋 Team assignments:
      Creative: ${creativeProvider}
      Technical: ${technicalProvider}
      Compositor: ${compositorProvider}
      Animator: ${animatorProvider}
      Reviewer: ${reviewerProvider}
    `);

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
      provider: creativeProvider,
      temperature: 0.9,
    });

    const concept = this.parseJSON(creativeResponse);
    console.log(`   Creative concept (${creativeProvider}):`, concept);

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
      provider: technicalProvider,
      temperature: 0.3,
    });

    const technical = this.parseJSON(technicalResponse);
    console.log(`   Technical specs (${technicalProvider}):`, technical);

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
      provider: compositorProvider,
      temperature: 0.5,
    });

    const finalLayout = this.parseJSON(compositorResponse);
    console.log(`   Final layout (${compositorProvider}):`, finalLayout);

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
      provider: animatorProvider,
      temperature: 0.7,
    });

    const withAnimation = this.parseJSON(animatorResponse);
    console.log(`   Animation (${animatorProvider}): added`);

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
      provider: reviewerProvider,
      temperature: 0.3,
    });

    const review = this.parseJSON(reviewerResponse);

    console.log(`   Review (${reviewerProvider}):`, review);

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

  /**
   * Get current team configuration
   */
  getTeamConfig(): Record<string, { role: AIRole['role']; provider: AIProviderType }> {
    const config: Record<string, { role: AIRole['role']; provider: AIProviderType }> = {};

    for (const [roleKey, roleData] of Object.entries(this.AI_TEAM)) {
      config[roleKey] = {
        role: roleData.role,
        provider: roleData.provider,
      };
    }

    return config;
  }

  /**
   * Log current team status
   */
  logTeamStatus(): void {
    const availableProviders = aiProviderService.getAvailableProviders();
    console.log('\n🤖 AI Team Status:');
    console.log(`   Available providers: ${availableProviders.join(', ')} (${availableProviders.length}/4)`);
    console.log('   Role assignments:');

    for (const [roleKey, roleData] of Object.entries(this.AI_TEAM)) {
      console.log(`     ${roleKey}: ${roleData.provider} - ${roleData.description}`);
    }
    console.log('');
  }
}

export const aiMultiProviderService = AIMultiProviderService.getInstance();
