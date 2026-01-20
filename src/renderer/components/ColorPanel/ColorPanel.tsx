/**
 * Color Panel - Lumetri Color analog (professional color grading)
 */

import React, { useState } from 'react';
import './ColorPanel.css';

interface ColorSettings {
  // Basic Correction
  temperature: number;
  tint: number;
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  saturation: number;

  // Creative
  look: string;
  intensity: number;
  sharpening: number;
  vibrance: number;

  // Curves
  // HSL Secondary
  // Vignette
}

export const ColorPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Set<string>>(
    new Set(['basic', 'creative'])
  );
  const [settings, setSettings] = useState<ColorSettings>({
    temperature: 0,
    tint: 0,
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 0,
    look: 'none',
    intensity: 100,
    sharpening: 0,
    vibrance: 0,
  });

  const [aiMode, setAiMode] = useState(false);

  const toggleSection = (section: string) => {
    const newSections = new Set(activeSection);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setActiveSection(newSections);
  };

  const handleSliderChange = (key: keyof ColorSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  const resetAll = () => {
    setSettings({
      temperature: 0,
      tint: 0,
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      look: 'none',
      intensity: 100,
      sharpening: 0,
      vibrance: 0,
    });
  };

  const applyAIColorGrade = async () => {
    setAiMode(true);
    // TODO: Call AI service to analyze clip and suggest color grading
    setTimeout(() => {
      // Mock AI adjustments
      setSettings({
        ...settings,
        temperature: 10,
        contrast: 15,
        saturation: 5,
        exposure: 5,
      });
      setAiMode(false);
    }, 2000);
  };

  return (
    <div className="color-panel">
      <div className="color-panel__header">
        <h3 className="color-panel__title">Lumetri Color</h3>
        <div className="color-panel__actions">
          <button className="btn btn--small btn--ai" onClick={applyAIColorGrade}>
            🤖 AI Auto-Grade
          </button>
          <button className="btn btn--small" onClick={resetAll}>
            Reset
          </button>
        </div>
      </div>

      <div className="color-panel__content">
        {/* Basic Correction */}
        <div className="color-section">
          <div
            className="color-section__header"
            onClick={() => toggleSection('basic')}
          >
            <span className="color-section__toggle">
              {activeSection.has('basic') ? '▼' : '▶'}
            </span>
            <span className="color-section__title">Basic Correction</span>
          </div>

          {activeSection.has('basic') && (
            <div className="color-section__content">
              <ColorSlider
                label="Temperature"
                value={settings.temperature}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('temperature', v)}
                color="gradient(to right, #0080ff, #ff8000)"
              />
              <ColorSlider
                label="Tint"
                value={settings.tint}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('tint', v)}
                color="gradient(to right, #00ff00, #ff00ff)"
              />
              <ColorSlider
                label="Exposure"
                value={settings.exposure}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('exposure', v)}
              />
              <ColorSlider
                label="Contrast"
                value={settings.contrast}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('contrast', v)}
              />
              <ColorSlider
                label="Highlights"
                value={settings.highlights}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('highlights', v)}
              />
              <ColorSlider
                label="Shadows"
                value={settings.shadows}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('shadows', v)}
              />
              <ColorSlider
                label="Whites"
                value={settings.whites}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('whites', v)}
              />
              <ColorSlider
                label="Blacks"
                value={settings.blacks}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('blacks', v)}
              />
              <ColorSlider
                label="Saturation"
                value={settings.saturation}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('saturation', v)}
              />
            </div>
          )}
        </div>

        {/* Creative */}
        <div className="color-section">
          <div
            className="color-section__header"
            onClick={() => toggleSection('creative')}
          >
            <span className="color-section__toggle">
              {activeSection.has('creative') ? '▼' : '▶'}
            </span>
            <span className="color-section__title">Creative</span>
          </div>

          {activeSection.has('creative') && (
            <div className="color-section__content">
              <div className="control-group">
                <label className="control-label">Look</label>
                <select
                  className="control-select"
                  value={settings.look}
                  onChange={(e) =>
                    setSettings({ ...settings, look: e.target.value })
                  }
                >
                  <option value="none">None</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="vintage">Vintage</option>
                  <option value="film_noir">Film Noir</option>
                  <option value="vibrant">Vibrant</option>
                </select>
              </div>

              <ColorSlider
                label="Intensity"
                value={settings.intensity}
                min={0}
                max={100}
                onChange={(v) => handleSliderChange('intensity', v)}
              />
              <ColorSlider
                label="Sharpening"
                value={settings.sharpening}
                min={0}
                max={100}
                onChange={(v) => handleSliderChange('sharpening', v)}
              />
              <ColorSlider
                label="Vibrance"
                value={settings.vibrance}
                min={-100}
                max={100}
                onChange={(v) => handleSliderChange('vibrance', v)}
              />
            </div>
          )}
        </div>

        {/* Curves */}
        <div className="color-section">
          <div
            className="color-section__header"
            onClick={() => toggleSection('curves')}
          >
            <span className="color-section__toggle">
              {activeSection.has('curves') ? '▼' : '▶'}
            </span>
            <span className="color-section__title">Curves</span>
          </div>

          {activeSection.has('curves') && (
            <div className="color-section__content">
              <div className="curves-editor">
                <div className="curves-editor__canvas">
                  {/* TODO: Implement curves editor with canvas */}
                  <div className="curves-placeholder">
                    <p>Curves Editor</p>
                    <p className="curves-placeholder__hint">
                      Click to add points on the curve
                    </p>
                  </div>
                </div>
                <div className="curves-editor__channels">
                  <button className="channel-btn channel-btn--active">RGB</button>
                  <button className="channel-btn">R</button>
                  <button className="channel-btn">G</button>
                  <button className="channel-btn">B</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Color Matching */}
        <div className="color-section">
          <div
            className="color-section__header"
            onClick={() => toggleSection('ai')}
          >
            <span className="color-section__toggle">
              {activeSection.has('ai') ? '▼' : '▶'}
            </span>
            <span className="color-section__title">🤖 AI Color Tools</span>
          </div>

          {activeSection.has('ai') && (
            <div className="color-section__content">
              <button className="ai-tool-btn">
                🎨 Match Color from Reference
              </button>
              <button className="ai-tool-btn">🌅 Auto Day/Night Detection</button>
              <button className="ai-tool-btn">🎬 Apply Cinematic LUT</button>
              <button className="ai-tool-btn">🔄 Color Consistency Across Clips</button>
            </div>
          )}
        </div>
      </div>

      {aiMode && (
        <div className="ai-processing-overlay">
          <div className="ai-processing">
            <div className="spinner"></div>
            <p>AI анализирует цвета...</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface ColorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  color?: string;
}

const ColorSlider: React.FC<ColorSliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  color,
}) => {
  return (
    <div className="color-slider">
      <div className="color-slider__header">
        <label className="color-slider__label">{label}</label>
        <input
          type="number"
          className="color-slider__value"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
        />
      </div>
      <input
        type="range"
        className="color-slider__range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        style={
          color
            ? {
                background: `linear-${color}`,
              }
            : undefined
        }
      />
    </div>
  );
};
