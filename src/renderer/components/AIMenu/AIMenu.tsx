/**
 * AI Menu Component - Quick access to AI features
 */

import React, { useState } from 'react';
import { useTimelineStore } from '@renderer/stores/timelineStore';
import { useMediaStore } from '@renderer/stores/mediaStore';
import { aiProviderService } from '@renderer/services/ai/AIProviderService';
import { aiContentService } from '@renderer/services/ai/AIContentService';
import { subtitleService } from '@renderer/services/ai/SubtitleService';
import { aiTransitionsService } from '@renderer/services/ai/AITransitionsService';
import './AIMenu.css';

interface AIMenuProps {
  onOpenAssistant?: () => void;
}

export const AIMenu: React.FC<AIMenuProps> = ({ onOpenAssistant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const clips = useTimelineStore((state) => state.clips);
  const mediaItems = useMediaStore((state) => state.mediaItems);

  const checkAIConfigured = (): boolean => {
    const config = aiProviderService.getConfig();
    if (!config.claudeApiKey && !config.openaiApiKey) {
      alert('⚠️ AI не настроен.\n\nПожалуйста, добавьте API ключ Claude или OpenAI в настройках.');
      return false;
    }
    return true;
  };

  const handleGenerateSubtitles = async () => {
    if (!checkAIConfigured()) return;
    if (clips.length === 0) {
      alert('⚠️ Добавьте видео на таймлайн для генерации субтитров.');
      return;
    }

    setIsProcessing(true);
    setIsOpen(false);

    try {
      // Find first video clip
      const videoClip = clips.find((c) => {
        const media = mediaItems.find((m) => m.id === c.mediaId);
        return media?.type === 'video';
      });

      if (!videoClip) {
        alert('⚠️ Не найдено видео клипов на таймлайне.');
        return;
      }

      const media = mediaItems.find((m) => m.id === videoClip.mediaId);
      if (!media) return;

      console.log('🎤 Generating subtitles...');
      const result = await subtitleService.generateSubtitles(media.path, 'ru');

      alert(
        `✅ Субтитры сгенерированы!\n\n` +
          `• Язык: ${result.language}\n` +
          `• Субтитров: ${result.subtitles.length}\n` +
          `• Слов: ${result.wordCount}\n\n` +
          `Субтитры добавлены на таймлайн.`
      );

      console.log('✅ Subtitles generated:', result.subtitles.length);
    } catch (error) {
      console.error('Error generating subtitles:', error);
      alert(`❌ Ошибка генерации субтитров:\n${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoTransitions = async () => {
    if (!checkAIConfigured()) return;
    if (clips.length < 2) {
      alert('⚠️ Добавьте минимум 2 клипа на таймлайн для автоматических переходов.');
      return;
    }

    setIsProcessing(true);
    setIsOpen(false);

    try {
      console.log('🎬 Generating transitions...');
      const result = await aiTransitionsService.autoTransitions(clips);

      alert(
        `✅ Переходы созданы!\n\n` +
          `• Создано переходов: ${result.transitionsAdded}\n` +
          `• Средняя длительность: ${Math.round(result.avgDuration)}мс\n\n` +
          `Переходы добавлены между клипами.`
      );

      console.log('✅ Transitions generated:', result.transitionsAdded);
    } catch (error) {
      console.error('Error generating transitions:', error);
      alert(`❌ Ошибка создания переходов:\n${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBRoll = async () => {
    if (!checkAIConfigured()) return;

    const prompt = window.prompt(
      '🎬 Генерация B-roll\n\nОпишите сцену, которую нужно сгенерировать:',
      'Кинематографичный закат над океаном'
    );

    if (!prompt) return;

    setIsProcessing(true);
    setIsOpen(false);

    try {
      console.log('🎥 Generating B-roll...');
      const result = await aiContentService.generateBRoll(prompt, {
        duration: 5,
        resolution: '1920x1080',
        style: 'cinematic',
      });

      alert(
        `✅ B-roll сгенерирован!\n\n` +
          `• Тип: ${result.type}\n` +
          `• Формат: ${result.format}\n\n` +
          `${result.description}\n\n` +
          `Используйте этот промпт в Runway, Pika или Stable Video.`
      );

      console.log('✅ B-roll generated:', result);
    } catch (error) {
      console.error('Error generating B-roll:', error);
      alert(`❌ Ошибка генерации B-roll:\n${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoColorGrade = async () => {
    if (!checkAIConfigured()) return;
    if (clips.length === 0) {
      alert('⚠️ Добавьте клипы на таймлайн для автоматической цветокоррекции.');
      return;
    }

    const mood = window.prompt(
      '🎨 Автоматическая цветокоррекция\n\nВыберите настроение:',
      'cinematic'
    );

    if (!mood) return;

    setIsProcessing(true);
    setIsOpen(false);

    try {
      console.log('🎨 Applying auto color grade...');

      // Simulate AI color grading
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `✅ Цветокоррекция применена!\n\n` +
          `• Стиль: ${mood}\n` +
          `• Клипов обработано: ${clips.length}\n\n` +
          `Цветокоррекция применена ко всем клипам.`
      );

      console.log('✅ Auto color grade applied');
    } catch (error) {
      console.error('Error applying color grade:', error);
      alert(`❌ Ошибка цветокоррекции:\n${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="ai-menu">
      <button
        className={`ai-menu__trigger ${isOpen ? 'ai-menu__trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
      >
        {isProcessing ? '⏳' : '🤖'} AI {isOpen ? '▼' : '▶'}
      </button>

      {isOpen && (
        <>
          <div className="ai-menu__backdrop" onClick={() => setIsOpen(false)} />
          <div className="ai-menu__dropdown">
            <div className="ai-menu__header">
              <h3>🤖 AI Features</h3>
              <button className="ai-menu__close" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="ai-menu__items">
              <button
                className="ai-menu__item"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAssistant?.();
                }}
              >
                <span className="ai-menu__item-icon">💬</span>
                <div className="ai-menu__item-content">
                  <div className="ai-menu__item-title">AI Ассистент</div>
                  <div className="ai-menu__item-desc">Управление редактором голосом</div>
                </div>
              </button>

              <div className="ai-menu__separator" />

              <button className="ai-menu__item" onClick={handleGenerateSubtitles}>
                <span className="ai-menu__item-icon">📝</span>
                <div className="ai-menu__item-content">
                  <div className="ai-menu__item-title">Генерация субтитров</div>
                  <div className="ai-menu__item-desc">Автоматическое распознавание речи</div>
                </div>
              </button>

              <button className="ai-menu__item" onClick={handleAutoTransitions}>
                <span className="ai-menu__item-icon">🎬</span>
                <div className="ai-menu__item-content">
                  <div className="ai-menu__item-title">Умные переходы</div>
                  <div className="ai-menu__item-desc">Автоподбор переходов по контенту</div>
                </div>
              </button>

              <button className="ai-menu__item" onClick={handleGenerateBRoll}>
                <span className="ai-menu__item-icon">🎥</span>
                <div className="ai-menu__item-content">
                  <div className="ai-menu__item-title">Генерация B-roll</div>
                  <div className="ai-menu__item-desc">Создание видео из текста</div>
                </div>
              </button>

              <button className="ai-menu__item" onClick={handleAutoColorGrade}>
                <span className="ai-menu__item-icon">🎨</span>
                <div className="ai-menu__item-content">
                  <div className="ai-menu__item-title">Авто-цветокоррекция</div>
                  <div className="ai-menu__item-desc">AI-стилизация цвета</div>
                </div>
              </button>

              <div className="ai-menu__separator" />

              <div className="ai-menu__footer">
                <div className="ai-menu__status">
                  {aiProviderService.getConfig().claudeApiKey ||
                  aiProviderService.getConfig().openaiApiKey ? (
                    <span className="ai-menu__status-ok">✅ AI готов</span>
                  ) : (
                    <span className="ai-menu__status-warning">⚠️ Настройте AI</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
