/**
 * AI Editor Service - Claude API integration for video editing
 */

import { AICommand, ProjectContext, PreviewData } from '@shared/types';

export class AIEditorService {
  private apiKey: string | null = null;

  constructor() {
    // TODO: Load API key from settings
    this.apiKey = null;
  }

  /**
   * Parse user command into structured AI commands
   */
  async parseUserCommand(
    input: string,
    projectContext: ProjectContext
  ): Promise<AICommand[]> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    // TODO: Implement Claude API integration
    // const systemPrompt = this.buildSystemPrompt(projectContext);
    // const response = await this.callClaudeAPI(systemPrompt, input);
    // return this.extractCommands(response);

    // Temporary mock implementation
    return this.mockParseCommand(input);
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
   * Call Claude API (to be implemented)
   */
  private async callClaudeAPI(systemPrompt: string, userMessage: string): Promise<any> {
    // TODO: Implement Anthropic SDK integration
    throw new Error('Claude API integration not yet implemented');
  }
}

export const aiEditorService = new AIEditorService();
