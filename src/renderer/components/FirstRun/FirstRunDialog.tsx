/**
 * First Run Dialog - Welcome screen with multi-AI setup
 */

import React, { useState } from 'react';
import './FirstRunDialog.css';

interface FirstRunDialogProps {
  onComplete: (skipAI: boolean) => void;
}

interface AIKeys {
  claudeApiKey: string;
  openaiApiKey: string;
  sora2ApiKey: string;
  geminiApiKey: string;
}

export const FirstRunDialog: React.FC<FirstRunDialogProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<AIKeys>({
    claudeApiKey: '',
    openaiApiKey: '',
    sora2ApiKey: '',
    geminiApiKey: '',
  });

  const handleSaveAndContinue = () => {
    // Save all configured API keys
    const availableProviders: string[] = [];
    if (apiKeys.claudeApiKey.trim()) availableProviders.push('claude');
    if (apiKeys.openaiApiKey.trim()) availableProviders.push('openai');
    if (apiKeys.sora2ApiKey.trim()) availableProviders.push('sora2');
    if (apiKeys.geminiApiKey.trim()) availableProviders.push('gemini');

    const settings = {
      claudeApiKey: apiKeys.claudeApiKey.trim() || undefined,
      openaiApiKey: apiKeys.openaiApiKey.trim() || undefined,
      sora2ApiKey: apiKeys.sora2ApiKey.trim() || undefined,
      geminiApiKey: apiKeys.geminiApiKey.trim() || undefined,
      aiProvider: 'auto', // Auto-select best provider for each task
      autoSaveInterval: 5,
      theme: 'dark',
      defaultResolution: '1080p',
      defaultFrameRate: 30,
    };

    localStorage.setItem('app-settings', JSON.stringify(settings));
    localStorage.setItem('first-run-completed', 'true');

    console.log(`✅ Configured ${availableProviders.length}/4 AI providers:`, availableProviders);

    onComplete(false);
  };

  const handleSkip = () => {
    localStorage.setItem('first-run-completed', 'true');
    onComplete(true);
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateKey = (key: keyof AIKeys, value: string) => {
    setApiKeys((prev) => ({ ...prev, [key]: value }));
  };

  const hasAnyKey = Object.values(apiKeys).some((key) => key.trim() !== '');

  return (
    <div className="first-run-overlay">
      <div className="first-run-dialog">
        {step === 1 && (
          <>
            <div className="first-run-dialog__header">
              <h1 className="first-run-dialog__title">
                🎬 Добро пожаловать в AI Video Editor PRO
              </h1>
              <p className="first-run-dialog__subtitle">
                Профессиональный видеоредактор с командой AI-специалистов
              </p>
            </div>

            <div className="first-run-dialog__content">
              <div className="welcome-features">
                <div className="welcome-feature">
                  <div className="welcome-feature__icon">🎞️</div>
                  <h3>Все функции Premiere Pro</h3>
                  <p>
                    Multi-track timeline, 50+ effects, Lumetri Color, Essential Graphics
                  </p>
                </div>

                <div className="welcome-feature">
                  <div className="welcome-feature__icon">🤖</div>
                  <h3>Команда AI Ассистентов</h3>
                  <p>
                    4 специализированных AI работают вместе для профессионального монтажа
                  </p>
                </div>

                <div className="welcome-feature">
                  <div className="welcome-feature__icon">🎨</div>
                  <h3>AI Профессиональная обработка</h3>
                  <p>
                    3D эффекты, умные переходы, автоматическая композиция
                  </p>
                </div>

                <div className="welcome-feature">
                  <div className="welcome-feature__icon">💰</div>
                  <h3>Гибкая настройка</h3>
                  <p>
                    Используйте 1, 2, 3 или все 4 AI - система адаптируется автоматически
                  </p>
                </div>
              </div>
            </div>

            <div className="first-run-dialog__footer">
              <button className="btn btn--primary btn--large" onClick={() => setStep(2)}>
                Настроить AI команду →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="first-run-dialog__header">
              <h1 className="first-run-dialog__title">🤖 Настройка AI Команды</h1>
              <p className="first-run-dialog__subtitle">
                Каждый AI выполняет свою роль. Настройте минимум 1 AI для работы.
              </p>
            </div>

            <div className="first-run-dialog__content">
              <div className="ai-setup-multi">
                {/* Claude - Technical Director */}
                <div className="ai-provider-card">
                  <div className="ai-provider-card__header">
                    <strong>🧠 Claude 3.5 Sonnet</strong>
                    <span className="badge badge--technical">Технический директор</span>
                  </div>
                  <p className="ai-provider-card__role">
                    <strong>Роль:</strong> Точные параметры, структурный анализ, финальное ревью
                  </p>
                  <ul className="ai-provider-card__features">
                    <li>✅ Лучшее понимание команд редактирования</li>
                    <li>✅ Точные технические расчеты</li>
                    <li>✅ Большой контекст (200K токенов)</li>
                  </ul>
                  <div className="api-key-input-group">
                    <input
                      type={showKeys.claude ? 'text' : 'password'}
                      className="api-key-input"
                      value={apiKeys.claudeApiKey}
                      onChange={(e) => updateKey('claudeApiKey', e.target.value)}
                      placeholder="sk-ant-api03-..."
                    />
                    <button
                      className="api-key-toggle"
                      onClick={() => toggleKeyVisibility('claude')}
                    >
                      {showKeys.claude ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-provider-card__link"
                  >
                    Получить API ключ →
                  </a>
                </div>

                {/* ChatGPT - Creative Director */}
                <div className="ai-provider-card">
                  <div className="ai-provider-card__header">
                    <strong>💡 ChatGPT (GPT-5.2)</strong>
                    <span className="badge badge--creative">Креативный директор</span>
                  </div>
                  <p className="ai-provider-card__role">
                    <strong>Роль:</strong> Креативные идеи, стили, анимации
                  </p>
                  <ul className="ai-provider-card__features">
                    <li>✅ Лучший для генерации креативных концепций</li>
                    <li>✅ Отличные анимации и эффекты</li>
                    <li>✅ GPT-5.2 (2026) - новейшая модель</li>
                  </ul>
                  <div className="api-key-input-group">
                    <input
                      type={showKeys.openai ? 'text' : 'password'}
                      className="api-key-input"
                      value={apiKeys.openaiApiKey}
                      onChange={(e) => updateKey('openaiApiKey', e.target.value)}
                      placeholder="sk-proj-..."
                    />
                    <button
                      className="api-key-toggle"
                      onClick={() => toggleKeyVisibility('openai')}
                    >
                      {showKeys.openai ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-provider-card__link"
                  >
                    Получить API ключ →
                  </a>
                </div>

                {/* Sora2 - Video Generator */}
                <div className="ai-provider-card">
                  <div className="ai-provider-card__header">
                    <strong>🎥 Sora2</strong>
                    <span className="badge badge--video">Видео генератор</span>
                  </div>
                  <p className="ai-provider-card__role">
                    <strong>Роль:</strong> AI генерация видео из изображений, создание движения
                  </p>
                  <ul className="ai-provider-card__features">
                    <li>✅ Генерация AI видео из фото</li>
                    <li>✅ Создание динамических эффектов</li>
                    <li>✅ Text-to-video и image-to-video</li>
                  </ul>
                  <div className="api-key-input-group">
                    <input
                      type={showKeys.sora2 ? 'text' : 'password'}
                      className="api-key-input"
                      value={apiKeys.sora2ApiKey}
                      onChange={(e) => updateKey('sora2ApiKey', e.target.value)}
                      placeholder="sk-proj-..."
                    />
                    <button
                      className="api-key-toggle"
                      onClick={() => toggleKeyVisibility('sora2')}
                    >
                      {showKeys.sora2 ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-provider-card__link"
                  >
                    Получить API ключ (OpenAI) →
                  </a>
                </div>

                {/* Gemini - Compositor */}
                <div className="ai-provider-card">
                  <div className="ai-provider-card__header">
                    <strong>🎨 Gemini 1.5 Flash</strong>
                    <span className="badge badge--compositor">Композитор</span>
                  </div>
                  <p className="ai-provider-card__role">
                    <strong>Роль:</strong> Визуальная компоновка, расположение элементов
                  </p>
                  <ul className="ai-provider-card__features">
                    <li>✅ Отличное визуальное восприятие</li>
                    <li>✅ Быстрый и бюджетный</li>
                    <li>✅ Хорош для композиции сцен</li>
                  </ul>
                  <div className="api-key-input-group">
                    <input
                      type={showKeys.gemini ? 'text' : 'password'}
                      className="api-key-input"
                      value={apiKeys.geminiApiKey}
                      onChange={(e) => updateKey('geminiApiKey', e.target.value)}
                      placeholder="AIza..."
                    />
                    <button
                      className="api-key-toggle"
                      onClick={() => toggleKeyVisibility('gemini')}
                    >
                      {showKeys.gemini ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-provider-card__link"
                  >
                    Получить API ключ →
                  </a>
                </div>

                <div className="skip-option">
                  <strong>⚙️ Умное распределение ролей</strong>
                  <p>
                    Если вы настроили 3 из 4 AI - система автоматически перераспределит роли.
                    Даже с 1 AI все функции будут работать.
                  </p>
                  <p style={{ marginTop: '8px', fontSize: '14px', color: '#888' }}>
                    🔐 Все ключи хранятся только локально на вашем компьютере
                  </p>
                </div>
              </div>
            </div>

            <div className="first-run-dialog__footer">
              <button className="btn btn--secondary" onClick={handleSkip}>
                Пропустить (без AI)
              </button>
              <button
                className="btn btn--primary btn--large"
                onClick={handleSaveAndContinue}
                disabled={!hasAnyKey}
              >
                Продолжить ({Object.values(apiKeys).filter((k) => k.trim()).length}/4 AI) →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
