/**
 * AI Editor Service - Claude API integration for video editing
 */

import { AICommand, ProjectContext, PreviewData } from '@shared/types';

export class AIEditorService {
  private apiKey: string | null = null;

  constructor() {
    this.loadApiKey();
  }

  /**
   * Load API key from settings
   */
  private loadApiKey() {
    const settings = localStorage.getItem('app-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.apiKey = parsed.claudeApiKey || null;
    }
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Parse user command into structured AI commands
   */
  async parseUserCommand(
    input: string,
    projectContext: ProjectContext
  ): Promise<AICommand[]> {
    // Reload API key in case it was updated
    this.loadApiKey();

    if (!this.isAIAvailable()) {
      // Fall back to mock parser if no API key
      console.warn('AI not available, using basic parser');
      return this.mockParseCommand(input);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(projectContext);
      const response = await this.callClaudeAPI(systemPrompt, input);
      return this.extractCommands(response);
    } catch (error) {
      console.error('Claude API error:', error);
      // Fall back to mock parser
      return this.mockParseCommand(input);
    }
  }

  /**
   * Generate preview of what the commands will do
   */
  async generatePreview(commands: AICommand[]): Promise<PreviewData> {
    // TODO: Implement preview generation
    return {
      explanation: `Выполню ${commands.length} операций`,
      needsConfirmation: false,
      affectedClips: [],
    };
  }

  /**
   * Execute AI commands on the timeline
   */
  async executeCommands(commands: AICommand[]): Promise<void> {
    // TODO: Implement command execution
    // This should interact with timeline store to modify clips
    console.log('Executing commands:', commands);
  }

  /**
   * Build system prompt with project context
   */
  private buildSystemPrompt(context: ProjectContext): string {
    const mediaList = context.mediaItems
      .map((item) => `[${item.number}] ${item.type.toUpperCase()} | ${item.name}${item.duration ? ` | ${Math.round(item.duration / 1000)}s` : ''}`)
      .join('\n');

    return `
Ты — AI-ассистент видеоредактора. Твоя задача — понимать команды пользователя
и переводить их в структурированные инструкции для монтажа.

ДОСТУПНЫЕ МЕДИАФАЙЛЫ:
${mediaList}

ТЕКУЩИЙ ТАЙМЛАЙН:
- Дорожек: ${context.timelineState.tracks}
- Общая длительность: ${Math.round(context.timelineState.totalDuration / 1000)}s
- Клипов: ${context.timelineState.clipsCount}

ДОСТУПНЫЕ ЭФФЕКТЫ: ${context.availableEffects.join(', ')}
ДОСТУПНЫЕ ПЕРЕХОДЫ: ${context.availableTransitions.join(', ')}

ПРАВИЛА:
1. Всегда ссылайся на медиафайлы по их НОМЕРАМ (#1, #2, и т.д.)
2. Время указывай в формате MM:SS или секундах
3. Если команда неоднозначна — запроси уточнение
4. Перед деструктивными действиями (удаление) — проси подтверждение
5. Предлагай улучшения, если видишь возможность

ФОРМАТ ОТВЕТА:
Верни JSON объект с полями:
{
  "understood": true/false,
  "clarification_needed": "текст вопроса, если нужно",
  "actions": [
    {
      "action": "insert|trim|transition|effect|delete|move",
      "target": [номера медиафайлов],
      "params": {...}
    }
  ],
  "explanation": "что будет сделано"
}
    `.trim();
  }

  /**
   * Mock command parser for testing
   */
  private mockParseCommand(input: string): AICommand[] {
    const commands: AICommand[] = [];

    // Extract media numbers (e.g., #3, #5)
    const numberMatches = input.match(/#(\d+)/g);
    const mediaNumbers = numberMatches
      ? numberMatches.map((m) => parseInt(m.substring(1)))
      : [];

    // Detect command type
    if (input.includes('вставь') || input.includes('размести')) {
      commands.push({
        type: 'insert',
        mediaReferences: mediaNumbers,
        parameters: {},
      });
    } else if (input.includes('удали') || input.includes('убери')) {
      commands.push({
        type: 'delete',
        mediaReferences: mediaNumbers,
        parameters: {},
      });
    } else if (input.includes('переход')) {
      commands.push({
        type: 'transition',
        mediaReferences: mediaNumbers,
        parameters: { type: 'dissolve', duration: 500 },
      });
    } else if (input.includes('эффект')) {
      commands.push({
        type: 'effect',
        mediaReferences: mediaNumbers,
        parameters: {},
      });
    }

    return commands;
  }

  /**
   * Call Claude API
   */
  private async callClaudeAPI(systemPrompt: string, userMessage: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key not available');
    }

    // Note: In production, this should be done via IPC to main process for security
    // For now, making direct calls from renderer for simplicity
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Extract commands from Claude response
   */
  private extractCommands(response: any): AICommand[] {
    try {
      // Claude returns content in the first message
      const content = response.content?.[0]?.text || '';

      // Try to parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.actions && Array.isArray(parsed.actions)) {
          return parsed.actions.map((action: any) => ({
            type: action.action,
            mediaReferences: action.target || [],
            parameters: action.params || {},
          }));
        }
      }

      // Fallback to empty array if parsing fails
      return [];
    } catch (error) {
      console.error('Failed to extract commands from Claude response:', error);
      return [];
    }
  }
}

export const aiEditorService = new AIEditorService();
