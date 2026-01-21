/**
 * AI Provider Service - Multi-provider AI support (Claude, GPT-5.2, etc.)
 */

import Anthropic from '@anthropic-ai/sdk';

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'custom' | 'auto';
export type AIProviderType = AIProvider;

export interface AIConfig {
  provider: AIProvider;
  claudeApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  customApiKey?: string;
  customApiUrl?: string;
  customApiModel?: string;
  model?: string;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class AIProviderService {
  private static instance: AIProviderService;
  private anthropic: Anthropic | null = null;
  private config: AIConfig = {
    provider: 'auto',
  };

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    const settings = localStorage.getItem('app-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.config = {
        provider: parsed.aiProvider || 'auto',
        claudeApiKey: parsed.claudeApiKey || null,
        openaiApiKey: parsed.openaiApiKey || null,
        geminiApiKey: parsed.geminiApiKey || null,
        customApiKey: parsed.customApiKey || null,
        customApiUrl: parsed.customApiUrl || null,
        customApiModel: parsed.customApiModel || null,
        model: parsed.aiModel || null,
      };

      // Initialize Claude if key available
      if (this.config.claudeApiKey) {
        this.anthropic = new Anthropic({
          apiKey: this.config.claudeApiKey,
          dangerouslyAllowBrowser: true,
        });
      }
    }
  }

  /**
   * Check if any AI provider is available
   */
  isAvailable(): boolean {
    return !!(
      this.config.claudeApiKey ||
      this.config.openaiApiKey ||
      this.config.geminiApiKey ||
      this.config.customApiKey
    );
  }

  /**
   * Get best available provider for task
   */
  getBestProvider(task: 'generation' | 'analysis' | 'editing' | 'vision'): AIProvider {
    if (this.config.provider !== 'auto') {
      return this.config.provider;
    }

    // Auto-select based on task and availability
    switch (task) {
      case 'generation':
        // GPT-4o/5.2 better for creative generation
        return this.config.openaiApiKey ? 'openai' : this.config.claudeApiKey ? 'claude' : 'gemini';

      case 'analysis':
        // Claude better for structured analysis
        return this.config.claudeApiKey ? 'claude' : this.config.openaiApiKey ? 'openai' : 'gemini';

      case 'editing':
        // Claude better for precise editing commands
        return this.config.claudeApiKey ? 'claude' : this.config.openaiApiKey ? 'openai' : 'gemini';

      case 'vision':
        // Gemini/GPT better for vision
        return this.config.geminiApiKey ? 'gemini' : this.config.openaiApiKey ? 'openai' : 'claude';

      default:
        return this.config.claudeApiKey ? 'claude' : 'openai';
    }
  }

  /**
   * Send request to AI provider
   */
  async sendRequest(
    prompt: string,
    systemPrompt?: string,
    options: {
      provider?: AIProvider;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<AIResponse> {
    this.loadConfig(); // Reload in case settings changed

    const provider = options.provider || this.getBestProvider('editing');

    if (provider === 'claude' && this.config.claudeApiKey) {
      return this.sendClaudeRequest(prompt, systemPrompt, options);
    } else if (provider === 'openai' && this.config.openaiApiKey) {
      return this.sendOpenAIRequest(prompt, systemPrompt, options);
    }

    throw new Error('No AI provider available. Please configure API keys in Settings.');
  }

  /**
   * Generate completion with specified provider (NEW METHOD)
   */
  async generateCompletion(
    prompt: string,
    options: {
      provider?: AIProviderType;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const provider = options.provider || this.config.provider || 'auto';
    const actualProvider = provider === 'auto' ? this.getBestProvider('generation') : provider;

    const reqOptions = {
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048,
    };

    let response: AIResponse;

    switch (actualProvider) {
      case 'claude':
        response = await this.sendClaudeRequest(prompt, options.systemPrompt, reqOptions);
        break;
      case 'openai':
        response = await this.sendOpenAIRequest(prompt, options.systemPrompt, reqOptions);
        break;
      case 'gemini':
        response = await this.sendGeminiRequest(prompt, options.systemPrompt, reqOptions);
        break;
      default:
        throw new Error(`Unsupported provider: ${actualProvider}`);
    }

    return response.text;
  }

  /**
   * Send request to Claude
   */
  private async sendClaudeRequest(
    prompt: string,
    systemPrompt?: string,
    options: any = {}
  ): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Claude not initialized');
    }

    const response = await this.anthropic.messages.create({
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 1.0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      text,
      provider: 'claude',
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  /**
   * Send request to OpenAI GPT-5.2
   */
  private async sendOpenAIRequest(
    prompt: string,
    systemPrompt?: string,
    options: any = {}
  ): Promise<AIResponse> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-5.2-turbo', // GPT-5.2 (2026)
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.choices[0].message.content,
      provider: 'openai',
      model: data.model,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
      },
    };
  }

  /**
   * Send request to Google Gemini
   */
  private async sendGeminiRequest(
    prompt: string,
    systemPrompt?: string,
    options: any = {}
  ): Promise<AIResponse> {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens || 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize Claude if key changed
    if (config.claudeApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.claudeApiKey,
        dangerouslyAllowBrowser: true,
      });
    }

    // Save to localStorage
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    localStorage.setItem(
      'app-settings',
      JSON.stringify({
        ...settings,
        aiProvider: this.config.provider,
        claudeApiKey: this.config.claudeApiKey,
        openaiApiKey: this.config.openaiApiKey,
        geminiApiKey: this.config.geminiApiKey,
        customApiKey: this.config.customApiKey,
        customApiUrl: this.config.customApiUrl,
        customApiModel: this.config.customApiModel,
        aiModel: this.config.model,
      })
    );
  }

  /**
   * Get available models for provider
   */
  getAvailableModels(provider: AIProvider): string[] {
    switch (provider) {
      case 'claude':
        return [
          'claude-3-5-sonnet-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
        ];

      case 'openai':
        return [
          'gpt-5.2-turbo', // New GPT-5.2 (2026)
          'gpt-5.2', // Full GPT-5.2
          'gpt-4-turbo',
          'gpt-4',
          'gpt-3.5-turbo',
        ];

      default:
        return [];
    }
  }

  /**
   * Get current config
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Test API key validity
   */
  async testAPIKey(provider: AIProvider, apiKey: string): Promise<boolean> {
    try {
      if (provider === 'claude') {
        const client = new Anthropic({
          apiKey,
          dangerouslyAllowBrowser: true,
        });

        await client.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }],
        });

        return true;
      } else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 10,
          }),
        });

        return response.ok;
      }

      return false;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  /**
   * Get provider comparison info
   */
  getProviderInfo(): Record<AIProvider, {
    name: string;
    strengths: string[];
    pricing: string;
    models: string[];
  }> {
    return {
      claude: {
        name: 'Anthropic Claude',
        strengths: [
          'Best for structured editing commands',
          'Larger context window (200K tokens)',
          'More precise instruction following',
          'Better for analysis and reasoning',
        ],
        pricing: '$3 / $15 per 1M tokens (input/output)',
        models: this.getAvailableModels('claude'),
      },
      openai: {
        name: 'OpenAI GPT-5.2',
        strengths: [
          'Best for creative content generation',
          'Superior vision capabilities',
          'Excellent for B-roll suggestions',
          'Better multimodal understanding',
        ],
        pricing: '$5 / $20 per 1M tokens (input/output)',
        models: this.getAvailableModels('openai'),
      },
      auto: {
        name: 'Auto-Select',
        strengths: [
          'Automatically chooses best AI for each task',
          'Optimizes for quality and cost',
          'Falls back if one provider unavailable',
        ],
        pricing: 'Variable based on selected provider',
        models: [],
      },
    };
  }
}

// Singleton instance
export const aiProviderService = AIProviderService.getInstance();
