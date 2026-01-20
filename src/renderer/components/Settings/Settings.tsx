/**
 * Settings Panel - App settings including API keys
 */

import React, { useState, useEffect } from 'react';
import { aiProviderService } from '../../services/ai/AIProviderService';
import './Settings.css';

interface SettingsData {
  claudeApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  customApiKey: string;
  customApiUrl: string;
  customApiModel: string;
  aiProvider: 'claude' | 'openai' | 'gemini' | 'custom' | 'auto';
  aiModel: string;
  autoSaveInterval: number;
  theme: 'dark' | 'light';
  defaultResolution: string;
  defaultFrameRate: number;
}

export const Settings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsData>({
    claudeApiKey: '',
    openaiApiKey: '',
    geminiApiKey: '',
    customApiKey: '',
    customApiUrl: '',
    customApiModel: '',
    aiProvider: 'auto',
    aiModel: '',
    autoSaveInterval: 5,
    theme: 'dark',
    defaultResolution: '1080p',
    defaultFrameRate: 30,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'export'>('ai');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingKey, setTestingKey] = useState<'claude' | 'openai' | 'gemini' | 'custom' | null>(null);
  const [keyTestResults, setKeyTestResults] = useState<{
    claude?: boolean;
    openai?: boolean;
    gemini?: boolean;
    custom?: boolean;
  }>({});

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings));

    // Update AI provider service
    aiProviderService.updateConfig({
      provider: settings.aiProvider,
      claudeApiKey: settings.claudeApiKey,
      openaiApiKey: settings.openaiApiKey,
      geminiApiKey: settings.geminiApiKey,
      customApiKey: settings.customApiKey,
      customApiUrl: settings.customApiUrl,
      customApiModel: settings.customApiModel,
      model: settings.aiModel,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof SettingsData, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const testAPIKey = async (provider: 'claude' | 'openai' | 'gemini' | 'custom') => {
    setTestingKey(provider);

    let apiKey = '';
    switch (provider) {
      case 'claude':
        apiKey = settings.claudeApiKey;
        break;
      case 'openai':
        apiKey = settings.openaiApiKey;
        break;
      case 'gemini':
        apiKey = settings.geminiApiKey;
        break;
      case 'custom':
        apiKey = settings.customApiKey;
        break;
    }

    if (!apiKey || apiKey.trim().length === 0) {
      alert('Введите API ключ');
      setTestingKey(null);
      return;
    }

    try {
      const isValid = await aiProviderService.testAPIKey(provider, apiKey);
      setKeyTestResults({ ...keyTestResults, [provider]: isValid });

      const providerNames = {
        claude: 'Claude',
        openai: 'OpenAI',
        gemini: 'Google Gemini',
        custom: 'Custom API',
      };

      if (isValid) {
        alert(`✅ ${providerNames[provider]} API ключ работает!`);
      } else {
        alert(`❌ ${providerNames[provider]} API ключ недействителен`);
      }
    } catch (error) {
      console.error('Key test error:', error);
      setKeyTestResults({ ...keyTestResults, [provider]: false });
      alert(`❌ Ошибка проверки ключа: ${error}`);
    } finally {
      setTestingKey(null);
    }
  };

  const getAvailableModels = () => {
    if (settings.aiProvider === 'auto') {
      return [...aiProviderService.getAvailableModels('claude'), ...aiProviderService.getAvailableModels('openai')];
    }
    return aiProviderService.getAvailableModels(settings.aiProvider);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-modal__header">
          <h2>⚙️ Настройки</h2>
          <button className="settings-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-modal__tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Общие
          </button>
          <button
            className={`settings-tab ${activeTab === 'ai' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI
          </button>
          <button
            className={`settings-tab ${activeTab === 'export' ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            Экспорт
          </button>
        </div>

        <div className="settings-modal__content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>Общие настройки</h3>

              <div className="settings-group">
                <label className="settings-label">Тема</label>
                <select
                  className="settings-select"
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <option value="dark">Темная</option>
                  <option value="light">Светлая</option>
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Автосохранение (минуты)
                </label>
                <input
                  type="number"
                  className="settings-input"
                  value={settings.autoSaveInterval}
                  onChange={(e) =>
                    handleChange('autoSaveInterval', Number(e.target.value))
                  }
                  min={1}
                  max={60}
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="settings-section">
              <h3>🤖 AI Настройки</h3>

              <div className="settings-group">
                <label className="settings-label">AI Провайдер</label>
                <select
                  className="settings-select"
                  value={settings.aiProvider}
                  onChange={(e) => handleChange('aiProvider', e.target.value)}
                >
                  <option value="auto">🔄 Автовыбор (рекомендуется)</option>
                  <option value="claude">🔵 Anthropic Claude</option>
                  <option value="openai">🟢 OpenAI GPT</option>
                  <option value="gemini">🟡 Google Gemini</option>
                  <option value="custom">🔧 Custom API</option>
                </select>
                <p className="settings-hint">
                  {settings.aiProvider === 'auto' && 'Автоматически выбирает лучший AI для каждой задачи'}
                  {settings.aiProvider === 'claude' && 'Лучше для анализа и структурированных команд'}
                  {settings.aiProvider === 'openai' && 'Лучше для креативной генерации контента'}
                  {settings.aiProvider === 'gemini' && 'Бесплатный tier, хорошо для начинающих'}
                  {settings.aiProvider === 'custom' && 'Используйте собственный AI endpoint'}
                </p>
              </div>

              <div className="ai-help-banner">
                <p>📖 <strong>Нужна помощь с API ключами?</strong></p>
                <p>Смотрите подробную инструкцию в файле <code>API_KEYS_GUIDE.md</code> в корне проекта</p>
              </div>

              <div className="ai-providers-info">
                <div className="ai-provider-card">
                  <div className="ai-provider-card__header">
                    <strong>🔵 Claude 3.5 Sonnet</strong>
                    {settings.aiProvider === 'claude' && <span className="badge">Выбран</span>}
                  </div>
                  <ul className="ai-provider-card__features">
                    <li>✅ Лучшее понимание команд редактирования</li>
                    <li>✅ Контекст 200K токенов</li>
                    <li>✅ Точное следование инструкциям</li>
                    <li>💰 $3/$15 за 1M токенов</li>
                  </ul>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-provider-card__link"
                  >
                    Получить API ключ →
                  </a>
                </div>

                <div className="ai-provider-card">
                  <div className="ai-provider-card__header">
                    <strong>🟢 GPT-5.2 Turbo (2026)</strong>
                    {settings.aiProvider === 'openai' && <span className="badge">Выбран</span>}
                  </div>
                  <ul className="ai-provider-card__features">
                    <li>✅ Лучшая креативная генерация</li>
                    <li>✅ Превосходные vision capabilities</li>
                    <li>✅ Отлично для B-roll предложений</li>
                    <li>💰 $5/$20 за 1M токенов</li>
                  </ul>
                  <a
                    href="https://platform.openai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-provider-card__link"
                  >
                    Получить API ключ →
                  </a>
                </div>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Claude API Key
                  <span className="settings-label__hint">
                    (начинается с sk-ant-api...)
                  </span>
                </label>
                <div className="settings-input-group">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    className="settings-input"
                    value={settings.claudeApiKey}
                    onChange={(e) => handleChange('claudeApiKey', e.target.value)}
                    placeholder="sk-ant-api03-..."
                  />
                  <button
                    className="settings-input-btn"
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                  >
                    {showClaudeKey ? '🙈' : '👁️'}
                  </button>
                  <button
                    className="settings-input-btn settings-input-btn--test"
                    onClick={() => testAPIKey('claude')}
                    disabled={testingKey === 'claude'}
                  >
                    {testingKey === 'claude' ? '⏳' : '🧪'}
                  </button>
                </div>
                {keyTestResults.claude !== undefined && (
                  <p className={`settings-test-result ${keyTestResults.claude ? 'success' : 'error'}`}>
                    {keyTestResults.claude ? '✅ Ключ действителен' : '❌ Ключ недействителен'}
                  </p>
                )}
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  OpenAI API Key
                  <span className="settings-label__hint">
                    (начинается с sk-...)
                  </span>
                </label>
                <div className="settings-input-group">
                  <input
                    type={showOpenAIKey ? 'text' : 'password'}
                    className="settings-input"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                  <button
                    className="settings-input-btn"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? '🙈' : '👁️'}
                  </button>
                  <button
                    className="settings-input-btn settings-input-btn--test"
                    onClick={() => testAPIKey('openai')}
                    disabled={testingKey === 'openai'}
                  >
                    {testingKey === 'openai' ? '⏳' : '🧪'}
                  </button>
                </div>
                {keyTestResults.openai !== undefined && (
                  <p className={`settings-test-result ${keyTestResults.openai ? 'success' : 'error'}`}>
                    {keyTestResults.openai ? '✅ Ключ действителен' : '❌ Ключ недействителен'}
                  </p>
                )}
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Google Gemini API Key
                  <span className="settings-label__hint">
                    (начинается с AIzaSy...)
                  </span>
                </label>
                <div className="settings-input-group">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    className="settings-input"
                    value={settings.geminiApiKey}
                    onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                    placeholder="AIzaSy..."
                  />
                  <button
                    className="settings-input-btn"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    {showGeminiKey ? '🙈' : '👁️'}
                  </button>
                  <button
                    className="settings-input-btn settings-input-btn--test"
                    onClick={() => testAPIKey('gemini')}
                    disabled={testingKey === 'gemini'}
                  >
                    {testingKey === 'gemini' ? '⏳' : '🧪'}
                  </button>
                </div>
                {keyTestResults.gemini !== undefined && (
                  <p className={`settings-test-result ${keyTestResults.gemini ? 'success' : 'error'}`}>
                    {keyTestResults.gemini ? '✅ Ключ действителен' : '❌ Ключ недействителен'}
                  </p>
                )}
                <p className="settings-hint">
                  ✨ Бесплатный tier: 15 запросов/мин. Получить на{' '}
                  <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                    aistudio.google.com
                  </a>
                </p>
              </div>

              {settings.aiProvider === 'custom' && (
                <>
                  <div className="settings-group">
                    <label className="settings-label">Custom API URL</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={settings.customApiUrl}
                      onChange={(e) => handleChange('customApiUrl', e.target.value)}
                      placeholder="https://api.example.com/v1"
                    />
                    <p className="settings-hint">
                      OpenAI-совместимый endpoint (например: Together.ai, OpenRouter, Groq)
                    </p>
                  </div>

                  <div className="settings-group">
                    <label className="settings-label">Custom API Key</label>
                    <div className="settings-input-group">
                      <input
                        type={showCustomKey ? 'text' : 'password'}
                        className="settings-input"
                        value={settings.customApiKey}
                        onChange={(e) => handleChange('customApiKey', e.target.value)}
                        placeholder="Ваш custom API ключ"
                      />
                      <button
                        className="settings-input-btn"
                        onClick={() => setShowCustomKey(!showCustomKey)}
                      >
                        {showCustomKey ? '🙈' : '👁️'}
                      </button>
                      <button
                        className="settings-input-btn settings-input-btn--test"
                        onClick={() => testAPIKey('custom')}
                        disabled={testingKey === 'custom'}
                      >
                        {testingKey === 'custom' ? '⏳' : '🧪'}
                      </button>
                    </div>
                    {keyTestResults.custom !== undefined && (
                      <p className={`settings-test-result ${keyTestResults.custom ? 'success' : 'error'}`}>
                        {keyTestResults.custom ? '✅ Ключ действителен' : '❌ Ключ недействителен'}
                      </p>
                    )}
                  </div>

                  <div className="settings-group">
                    <label className="settings-label">Model Name</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={settings.customApiModel}
                      onChange={(e) => handleChange('customApiModel', e.target.value)}
                      placeholder="gpt-4, llama-3-70b, etc."
                    />
                    <p className="settings-hint">
                      Название модели как указано в документации вашего провайдера
                    </p>
                  </div>
                </>
              )}

              <div className="settings-group">
                <label className="settings-label">Модель (опционально)</label>
                <select
                  className="settings-select"
                  value={settings.aiModel}
                  onChange={(e) => handleChange('aiModel', e.target.value)}
                >
                  <option value="">Авто (рекомендуется)</option>
                  {getAvailableModels().map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <p className="settings-hint">
                  Оставьте "Авто" для автоматического выбора оптимальной модели
                </p>
              </div>

              <div className="settings-note">
                <strong>💡 Работа без API ключа:</strong>
                <p>
                  Вы можете использовать редактор без AI ключей. Все функции
                  редактирования будут доступны, кроме AI-ассистента, AI-генерации и AI-эффектов.
                </p>
              </div>

              <div className="settings-note settings-note--warning">
                <strong>🔐 Безопасность:</strong>
                <p>
                  API ключи хранятся локально на вашем компьютере и передаются только
                  в соответствующие API (Anthropic/OpenAI) для обработки запросов.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="settings-section">
              <h3>Настройки экспорта</h3>

              <div className="settings-group">
                <label className="settings-label">Разрешение по умолчанию</label>
                <select
                  className="settings-select"
                  value={settings.defaultResolution}
                  onChange={(e) => handleChange('defaultResolution', e.target.value)}
                >
                  <option value="720p">720p (1280×720)</option>
                  <option value="1080p">1080p (1920×1080)</option>
                  <option value="4k">4K (3840×2160)</option>
                  <option value="8k">8K (7680×4320)</option>
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label">FPS по умолчанию</label>
                <select
                  className="settings-select"
                  value={settings.defaultFrameRate}
                  onChange={(e) =>
                    handleChange('defaultFrameRate', Number(e.target.value))
                  }
                >
                  <option value={24}>24 fps</option>
                  <option value={25}>25 fps</option>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="settings-modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn--primary" onClick={handleSave}>
            {saved ? '✅ Сохранено!' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};
