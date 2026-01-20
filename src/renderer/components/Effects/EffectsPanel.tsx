/**
 * Effects Panel - Professional effects library (like Premiere Pro)
 */

import React, { useState } from 'react';
import { EFFECTS, TRANSITIONS } from '@shared/constants';
import './EffectsPanel.css';

interface Effect {
  id: string;
  name: string;
  category: string;
  params: any;
}

export const EffectsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'transitions'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['color']));

  const videoEffects: Effect[] = [
    // Color Correction
    { id: 'lumetri', name: 'Lumetri Color', category: 'Color Correction', params: {} },
    { id: 'brightness', name: 'Brightness & Contrast', category: 'Color Correction', params: {} },
    { id: 'hue_saturation', name: 'Hue/Saturation', category: 'Color Correction', params: {} },
    { id: 'color_balance', name: 'Color Balance', category: 'Color Correction', params: {} },
    { id: 'curves', name: 'Curves', category: 'Color Correction', params: {} },
    { id: 'levels', name: 'Levels', category: 'Color Correction', params: {} },

    // Transform
    { id: 'transform', name: 'Transform', category: 'Transform', params: {} },
    { id: 'crop', name: 'Crop', category: 'Transform', params: {} },
    { id: 'scale', name: 'Scale', category: 'Transform', params: {} },
    { id: 'position', name: 'Position', category: 'Transform', params: {} },
    { id: 'rotation', name: 'Rotation', category: 'Transform', params: {} },

    // Blur & Sharpen
    { id: 'gaussian_blur', name: 'Gaussian Blur', category: 'Blur & Sharpen', params: {} },
    { id: 'motion_blur', name: 'Motion Blur', category: 'Blur & Sharpen', params: {} },
    { id: 'sharpen', name: 'Sharpen', category: 'Blur & Sharpen', params: {} },
    { id: 'unsharp_mask', name: 'Unsharp Mask', category: 'Blur & Sharpen', params: {} },

    // Stylize
    { id: 'glow', name: 'Glow', category: 'Stylize', params: {} },
    { id: 'mosaic', name: 'Mosaic', category: 'Stylize', params: {} },
    { id: 'posterize', name: 'Posterize', category: 'Stylize', params: {} },
    { id: 'solarize', name: 'Solarize', category: 'Stylize', params: {} },

    // Keying
    { id: 'ultra_key', name: 'Ultra Key (Chroma Key)', category: 'Keying', params: {} },
    { id: 'luma_key', name: 'Luma Key', category: 'Keying', params: {} },
    { id: 'track_matte', name: 'Track Matte Key', category: 'Keying', params: {} },

    // AI Effects 🤖
    { id: 'ai_background_remove', name: '🤖 AI Background Remove', category: 'AI Effects', params: {} },
    { id: 'ai_object_remove', name: '🤖 AI Object Removal', category: 'AI Effects', params: {} },
    { id: 'ai_upscale', name: '🤖 AI Upscale', category: 'AI Effects', params: {} },
    { id: 'ai_stabilize', name: '🤖 AI Stabilization', category: 'AI Effects', params: {} },
    { id: 'ai_denoise', name: '🤖 AI Denoise', category: 'AI Effects', params: {} },
    { id: 'ai_color_match', name: '🤖 AI Color Match', category: 'AI Effects', params: {} },
    { id: 'ai_style_transfer', name: '🤖 AI Style Transfer', category: 'AI Effects', params: {} },
  ];

  const audioEffects: Effect[] = [
    { id: 'volume', name: 'Volume', category: 'Amplitude & Compression', params: {} },
    { id: 'normalize', name: 'Normalize', category: 'Amplitude & Compression', params: {} },
    { id: 'compressor', name: 'Dynamics', category: 'Amplitude & Compression', params: {} },
    { id: 'limiter', name: 'Limiter', category: 'Amplitude & Compression', params: {} },

    { id: 'eq', name: 'Parametric Equalizer', category: 'EQ', params: {} },
    { id: 'bass_treble', name: 'Bass & Treble', category: 'EQ', params: {} },

    { id: 'reverb', name: 'Reverb', category: 'Delay & Echo', params: {} },
    { id: 'delay', name: 'Delay', category: 'Delay & Echo', params: {} },
    { id: 'echo', name: 'Echo', category: 'Delay & Echo', params: {} },

    { id: 'noise_reduction', name: 'Noise Reduction', category: 'Noise Reduction', params: {} },
    { id: 'denoiser', name: 'DeNoiser', category: 'Noise Reduction', params: {} },

    // AI Audio Effects 🤖
    { id: 'ai_enhance', name: '🤖 AI Audio Enhance', category: 'AI Audio', params: {} },
    { id: 'ai_voice_isolate', name: '🤖 AI Voice Isolation', category: 'AI Audio', params: {} },
    { id: 'ai_music_separate', name: '🤖 AI Music Separation', category: 'AI Audio', params: {} },
    { id: 'ai_transcribe', name: '🤖 AI Speech-to-Text', category: 'AI Audio', params: {} },
  ];

  const transitions = Object.entries(TRANSITIONS).map(([id, data]) => ({
    id,
    name: data.name,
    category: 'Transitions',
    params: data.params,
  }));

  const getEffectsList = () => {
    switch (activeTab) {
      case 'video':
        return videoEffects;
      case 'audio':
        return audioEffects;
      case 'transitions':
        return transitions;
    }
  };

  const filteredEffects = getEffectsList().filter((effect) =>
    effect.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedEffects = filteredEffects.reduce((acc, effect) => {
    if (!acc[effect.category]) {
      acc[effect.category] = [];
    }
    acc[effect.category].push(effect);
    return acc;
  }, {} as Record<string, Effect[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (effect: Effect, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'effect',
        effectId: effect.id,
        effectName: effect.name,
      })
    );
  };

  return (
    <div className="effects-panel">
      <div className="effects-panel__header">
        <h3 className="effects-panel__title">Эффекты</h3>
      </div>

      <div className="effects-panel__tabs">
        <button
          className={`tab ${activeTab === 'video' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          Видео
        </button>
        <button
          className={`tab ${activeTab === 'audio' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          Аудио
        </button>
        <button
          className={`tab ${activeTab === 'transitions' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('transitions')}
        >
          Переходы
        </button>
      </div>

      <div className="effects-panel__search">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Поиск эффектов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="effects-panel__content">
        {Object.entries(groupedEffects).map(([category, effects]) => (
          <div key={category} className="effect-category">
            <div
              className="effect-category__header"
              onClick={() => toggleCategory(category)}
            >
              <span className="effect-category__toggle">
                {expandedCategories.has(category) ? '▼' : '▶'}
              </span>
              <span className="effect-category__name">{category}</span>
              <span className="effect-category__count">({effects.length})</span>
            </div>

            {expandedCategories.has(category) && (
              <div className="effect-category__items">
                {effects.map((effect) => (
                  <div
                    key={effect.id}
                    className="effect-item"
                    draggable
                    onDragStart={(e) => handleDragStart(effect, e)}
                    title={`Перетащите на клип или используйте AI: "Примени ${effect.name} к #3"`}
                  >
                    <span className="effect-item__icon">✨</span>
                    <span className="effect-item__name">{effect.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredEffects.length === 0 && (
          <div className="effects-panel__empty">
            <p>Эффекты не найдены</p>
            <p className="effects-panel__empty-hint">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        )}
      </div>

      <div className="effects-panel__ai-tips">
        <details>
          <summary>💡 AI Команды для эффектов</summary>
          <div className="ai-tips-content">
            <p>"Примени Lumetri Color к #5"</p>
            <p>"Добавь AI стабилизацию к клипу #3"</p>
            <p>"Убери фон с видео #7 через AI"</p>
            <p>"Сделай AI upscale для #2"</p>
          </div>
        </details>
      </div>
    </div>
  );
};
