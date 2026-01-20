/**
 * AI Assistant Component - Claude-powered editing assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@shared/types';
import { aiEditorService } from '@renderer/services/ai/AIEditorService';
import { aiCommandExecutor } from '@renderer/services/ai/AICommandExecutor';
import { aiProviderService } from '@renderer/services/ai/AIProviderService';
import { useTimelineStore } from '@renderer/stores/timelineStore';
import { useMediaStore } from '@renderer/stores/mediaStore';
import './AIAssistant.css';

export const AIAssistant: React.FC = () => {
  const clips = useTimelineStore((state) => state.clips);
  const mediaItems = useMediaStore((state) => state.mediaItems);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Привет! Я AI-ассистент для видеомонтажа. Используй номера медиафайлов для команд, например: "Вставь #3 после #1" или "Добавь переход между #2 и #5"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsProcessing(true);

    try {
      // Check if AI is configured
      const config = aiProviderService.getConfig();
      if (!config.claudeApiKey && !config.openaiApiKey) {
        throw new Error(
          'AI не настроен. Пожалуйста, добавьте API ключ Claude или OpenAI в настройках.'
        );
      }

      // Build project context
      const projectContext = {
        clips,
        mediaItems,
        currentTime: 0,
        totalDuration: clips.reduce((sum, c) => sum + c.duration, 0),
      };

      // Parse command using AI
      const commands = await aiEditorService.parseUserCommand(userInput, projectContext);

      // Execute commands
      const result = await aiCommandExecutor.executeCommands(commands);

      // Create response message
      let responseContent = '';
      if (result.success) {
        responseContent = `✅ Выполнено!\n\n`;
        if (result.addedClips > 0) {
          responseContent += `• Добавлено клипов: ${result.addedClips}\n`;
        }
        if (result.modifiedClips > 0) {
          responseContent += `• Изменено клипов: ${result.modifiedClips}\n`;
        }
        if (result.deletedClips > 0) {
          responseContent += `• Удалено клипов: ${result.deletedClips}\n`;
        }
        if (result.addedEffects > 0) {
          responseContent += `• Применено эффектов: ${result.addedEffects}\n`;
        }
        if (result.message) {
          responseContent += `\n${result.message}`;
        }
      } else {
        responseContent = `❌ Ошибка выполнения:\n${result.message || 'Неизвестная ошибка'}`;
        if (result.errors && result.errors.length > 0) {
          responseContent += '\n\nДетали:\n' + result.errors.join('\n');
        }
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        isError: !result.success,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickCommands = [
    { label: 'Вставить медиа', value: 'Вставь #' },
    { label: 'Добавить переход', value: 'Добавь переход между #' },
    { label: 'Применить эффект', value: 'Примени эффект к #' },
    { label: 'Обрезать клип', value: 'Обрежь клип #' },
  ];

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`ai-assistant ${!isExpanded ? 'ai-assistant--collapsed' : ''}`}>
      <div className="ai-assistant__header">
        <div className="ai-assistant__title">
          <span className="ai-assistant__icon">🤖</span>
          <h3>AI Ассистент</h3>
        </div>
        <button
          className="ai-assistant__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Свернуть' : 'Развернуть'}
        >
          {isExpanded ? '▶' : '◀'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="ai-assistant__quick-commands">
            <div className="quick-commands__label">Быстрые команды:</div>
            <div className="quick-commands__list">
              {quickCommands.map((cmd, i) => (
                <button
                  key={i}
                  className="quick-command"
                  onClick={() => setInput(cmd.value)}
                  title={cmd.label}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-assistant__messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message message--${msg.role} ${msg.isError ? 'message--error' : ''}`}
              >
                <div className="message__header">
                  <span className="message__author">
                    {msg.role === 'user' ? 'Вы' : 'AI'}
                  </span>
                  <span className="message__time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message__content">{msg.content}</div>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="message__actions">
                    <button className="message__action-btn message__action-btn--primary">
                      ✓ Применить
                    </button>
                    <button className="message__action-btn">✕ Отмена</button>
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="message message--assistant">
                <div className="message__header">
                  <span className="message__author">AI</span>
                </div>
                <div className="message__content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-assistant__input-form" onSubmit={handleSubmit}>
            <textarea
              className="ai-assistant__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите команду... (напр: 'Вставь #3 после #1')"
              rows={3}
              disabled={isProcessing}
            />
            <button
              type="submit"
              className="ai-assistant__send-btn"
              disabled={!input.trim() || isProcessing}
              title="Отправить (Enter)"
            >
              {isProcessing ? '⏳' : '➤'}
            </button>
          </form>

          <div className="ai-assistant__help">
            <details>
              <summary>📖 Примеры команд</summary>
              <div className="help-content">
                <div className="help-section">
                  <h4>Монтаж:</h4>
                  <ul>
                    <li>"Вставь видео #3 в начало таймлайна"</li>
                    <li>"Размести картинку #7 с 00:15 до 00:20"</li>
                    <li>"Обрежь клип #2, оставь только с 10 по 25 секунду"</li>
                  </ul>
                </div>
                <div className="help-section">
                  <h4>Переходы:</h4>
                  <ul>
                    <li>"Добавь плавный переход между #3 и #5"</li>
                    <li>"Сделай crossfade между всеми клипами"</li>
                  </ul>
                </div>
                <div className="help-section">
                  <h4>Эффекты:</h4>
                  <ul>
                    <li>"Примени замедление x0.5 к клипу #8"</li>
                    <li>"Добавь эффект Ken Burns к изображениям #2, #5, #9"</li>
                  </ul>
                </div>
              </div>
            </details>
          </div>
        </>
      )}
    </div>
  );
};
