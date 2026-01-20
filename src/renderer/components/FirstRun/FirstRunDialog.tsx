/**
 * First Run Dialog - Welcome screen with API key setup
 */

import React, { useState } from 'react';
import './FirstRunDialog.css';

interface FirstRunDialogProps {
  onComplete: (skipAI: boolean) => void;
}

export const FirstRunDialog: React.FC<FirstRunDialogProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveAndContinue = () => {
    if (apiKey.trim()) {
      const settings = {
        claudeApiKey: apiKey,
        autoSaveInterval: 5,
        theme: 'dark',
        defaultResolution: '1080p',
        defaultFrameRate: 30,
      };
      localStorage.setItem('app-settings', JSON.stringify(settings));
    }
    localStorage.setItem('first-run-completed', 'true');
    onComplete(false);
  };

  const handleSkip = () => {
    localStorage.setItem('first-run-completed', 'true');
    onComplete(true);
  };

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
                Профессиональный видеоредактор с AI-суперспособностями
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
                  <h3>AI Ассистент</h3>
                  <p>
                    Редактируйте видео естественным языком: "Вставь #3 после #1"
                  </p>
                </div>

                <div className="welcome-feature">
                  <div className="welcome-feature__icon">🔢</div>
                  <h3>Умная нумерация</h3>
                  <p>
                    Каждый файл получает номер (#001, #002) для удобной работы с AI
                  </p>
                </div>

                <div className="welcome-feature">
                  <div className="welcome-feature__icon">💰</div>
                  <h3>Бесплатно навсегда</h3>
                  <p>
                    Open source. Без подписок. Все функции доступны
                  </p>
                </div>
              </div>
            </div>

            <div className="first-run-dialog__footer">
              <button className="btn btn--primary btn--large" onClick={() => setStep(2)}>
                Начать настройку →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="first-run-dialog__header">
              <h1 className="first-run-dialog__title">🤖 Настройка AI</h1>
              <p className="first-run-dialog__subtitle">
                Для работы AI-ассистента нужен API ключ
              </p>
            </div>

            <div className="first-run-dialog__content">
              <div className="ai-setup">
                <div className="ai-recommendation">
                  <h3>Рекомендуемый сервис:</h3>
                  <div className="ai-service-card">
                    <div className="ai-service-card__header">
                      <strong>Anthropic Claude API</strong>
                      <span className="badge">Рекомендуется</span>
                    </div>
                    <p className="ai-service-card__description">
                      Claude 3.5 Sonnet - лучшая модель для понимания команд редактирования
                    </p>
                    <ul className="ai-service-card__features">
                      <li>✅ Отличное понимание естественного языка</li>
                      <li>✅ Большой контекст (200K токенов)</li>
                      <li>✅ Точное выполнение команд</li>
                      <li>✅ Доступная цена: $3/$15 за 1M токенов</li>
                    </ul>
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ai-service-card__link"
                    >
                      Получить бесплатный API ключ →
                    </a>
                  </div>
                </div>

                <div className="api-key-input-section">
                  <label className="api-key-label">
                    Введите Claude API Key (начинается с sk-ant-api...)
                  </label>
                  <div className="api-key-input-group">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      className="api-key-input"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-ant-api03-..."
                    />
                    <button
                      className="api-key-toggle"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="api-key-hint">
                    🔐 Ключ хранится локально и используется только для AI команд
                  </p>
                </div>

                <div className="skip-option">
                  <strong>Хотите использовать без AI?</strong>
                  <p>
                    Все функции редактирования будут доступны. AI-ассистента можно
                    подключить позже в настройках.
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
                disabled={!apiKey.trim()}
              >
                Сохранить и продолжить →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
