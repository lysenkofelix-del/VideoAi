/**
 * Settings Panel - App settings including API keys
 */

import React, { useState, useEffect } from 'react';
import './Settings.css';

interface SettingsData {
  claudeApiKey: string;
  autoSaveInterval: number;
  theme: 'dark' | 'light';
  defaultResolution: string;
  defaultFrameRate: number;
}

export const Settings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsData>({
    claudeApiKey: '',
    autoSaveInterval: 5,
    theme: 'dark',
    defaultResolution: '1080p',
    defaultFrameRate: 30,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'export'>('ai');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof SettingsData, value: any) => {
    setSettings({ ...settings, [key]: value });
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

              <div className="ai-info-box">
                <h4>Рекомендуемый AI сервис:</h4>
                <div className="ai-service">
                  <div className="ai-service__header">
                    <strong>Anthropic Claude API</strong>
                    <span className="ai-service__badge">Рекомендуется</span>
                  </div>
                  <p className="ai-service__description">
                    Claude 3.5 Sonnet - лучшая модель для понимания команд редактирования
                  </p>
                  <ul className="ai-service__features">
                    <li>✅ Отличное понимание естественного языка</li>
                    <li>✅ Большой контекст (200K токенов)</li>
                    <li>✅ Точное выполнение команд</li>
                    <li>✅ Доступная цена ($3/$15 за 1M токенов)</li>
                  </ul>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-service__link"
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
                    type={showApiKey ? 'text' : 'password'}
                    className="settings-input"
                    value={settings.claudeApiKey}
                    onChange={(e) => handleChange('claudeApiKey', e.target.value)}
                    placeholder="sk-ant-api03-..."
                  />
                  <button
                    className="settings-input-btn"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="settings-note">
                <strong>💡 Работа без API ключа:</strong>
                <p>
                  Вы можете использовать редактор без AI ключа. Все функции
                  редактирования будут доступны, кроме AI-ассистента и AI-эффектов.
                </p>
              </div>

              <div className="settings-note settings-note--warning">
                <strong>🔐 Безопасность:</strong>
                <p>
                  API ключ хранится локально на вашем компьютере и никуда не
                  передается кроме API Anthropic для обработки команд.
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
