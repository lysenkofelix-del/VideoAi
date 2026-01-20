/**
 * Inspector Panel - Properties panel for selected clips (like Premiere Pro Effect Controls)
 */

import React, { useState } from 'react';
import './Inspector.css';

interface ClipProperties {
  // Motion
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  anchor: { x: number; y: number };
  opacity: number;

  // Time Remapping
  speed: number;
  reverse: boolean;
  frameBlending: boolean;

  // Audio
  volume: number;
  pan: number;
  mute: boolean;

  // Effects
  effects: any[];
}

export const Inspector: React.FC = () => {
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [properties, setProperties] = useState<ClipProperties>({
    position: { x: 0, y: 0 },
    scale: 100,
    rotation: 0,
    anchor: { x: 50, y: 50 },
    opacity: 100,
    speed: 100,
    reverse: false,
    frameBlending: false,
    volume: 100,
    pan: 0,
    mute: false,
    effects: [],
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['motion', 'time'])
  );

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  const updateProperty = (key: string, value: any) => {
    setProperties({ ...properties, [key]: value });
  };

  if (!selectedClip) {
    return (
      <div className="inspector">
        <div className="inspector__header">
          <h3 className="inspector__title">Инспектор</h3>
        </div>
        <div className="inspector__empty">
          <div className="empty-state">
            <div className="empty-state__icon">🎯</div>
            <p className="empty-state__title">Клип не выбран</p>
            <p className="empty-state__description">
              Выберите клип на таймлайне для редактирования свойств
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inspector">
      <div className="inspector__header">
        <h3 className="inspector__title">Инспектор</h3>
        <div className="inspector__clip-info">
          <span className="clip-number">#003</span>
          <span className="clip-name">video_clip.mp4</span>
        </div>
      </div>

      <div className="inspector__content">
        {/* Motion Section */}
        <div className="inspector-section">
          <div
            className="inspector-section__header"
            onClick={() => toggleSection('motion')}
          >
            <span className="inspector-section__toggle">
              {expandedSections.has('motion') ? '▼' : '▶'}
            </span>
            <span className="inspector-section__title">Motion</span>
            <button className="inspector-section__reset" title="Reset">
              ↺
            </button>
          </div>

          {expandedSections.has('motion') && (
            <div className="inspector-section__content">
              <PropertyGroup label="Position">
                <div className="property-row">
                  <PropertyInput
                    label="X"
                    value={properties.position.x}
                    onChange={(v) =>
                      updateProperty('position', { ...properties.position, x: v })
                    }
                  />
                  <PropertyInput
                    label="Y"
                    value={properties.position.y}
                    onChange={(v) =>
                      updateProperty('position', { ...properties.position, y: v })
                    }
                  />
                </div>
              </PropertyGroup>

              <PropertyGroup label="Scale">
                <PropertySlider
                  value={properties.scale}
                  min={0}
                  max={500}
                  onChange={(v) => updateProperty('scale', v)}
                  unit="%"
                />
              </PropertyGroup>

              <PropertyGroup label="Rotation">
                <PropertySlider
                  value={properties.rotation}
                  min={-360}
                  max={360}
                  onChange={(v) => updateProperty('rotation', v)}
                  unit="°"
                />
              </PropertyGroup>

              <PropertyGroup label="Anchor Point">
                <div className="property-row">
                  <PropertyInput
                    label="X"
                    value={properties.anchor.x}
                    onChange={(v) =>
                      updateProperty('anchor', { ...properties.anchor, x: v })
                    }
                  />
                  <PropertyInput
                    label="Y"
                    value={properties.anchor.y}
                    onChange={(v) =>
                      updateProperty('anchor', { ...properties.anchor, y: v })
                    }
                  />
                </div>
              </PropertyGroup>

              <PropertyGroup label="Opacity">
                <PropertySlider
                  value={properties.opacity}
                  min={0}
                  max={100}
                  onChange={(v) => updateProperty('opacity', v)}
                  unit="%"
                />
              </PropertyGroup>
            </div>
          )}
        </div>

        {/* Time Remapping */}
        <div className="inspector-section">
          <div
            className="inspector-section__header"
            onClick={() => toggleSection('time')}
          >
            <span className="inspector-section__toggle">
              {expandedSections.has('time') ? '▼' : '▶'}
            </span>
            <span className="inspector-section__title">Time Remapping</span>
          </div>

          {expandedSections.has('time') && (
            <div className="inspector-section__content">
              <PropertyGroup label="Speed">
                <PropertySlider
                  value={properties.speed}
                  min={1}
                  max={1000}
                  onChange={(v) => updateProperty('speed', v)}
                  unit="%"
                />
                <div className="property-presets">
                  <button
                    className="preset-btn"
                    onClick={() => updateProperty('speed', 50)}
                  >
                    50% (Slow)
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => updateProperty('speed', 100)}
                  >
                    100%
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => updateProperty('speed', 200)}
                  >
                    200% (Fast)
                  </button>
                </div>
              </PropertyGroup>

              <PropertyGroup label="Options">
                <label className="property-checkbox">
                  <input
                    type="checkbox"
                    checked={properties.reverse}
                    onChange={(e) => updateProperty('reverse', e.target.checked)}
                  />
                  <span>Reverse Speed</span>
                </label>
                <label className="property-checkbox">
                  <input
                    type="checkbox"
                    checked={properties.frameBlending}
                    onChange={(e) => updateProperty('frameBlending', e.target.checked)}
                  />
                  <span>Frame Blending</span>
                </label>
              </PropertyGroup>
            </div>
          )}
        </div>

        {/* Audio */}
        <div className="inspector-section">
          <div
            className="inspector-section__header"
            onClick={() => toggleSection('audio')}
          >
            <span className="inspector-section__toggle">
              {expandedSections.has('audio') ? '▼' : '▶'}
            </span>
            <span className="inspector-section__title">Audio</span>
          </div>

          {expandedSections.has('audio') && (
            <div className="inspector-section__content">
              <PropertyGroup label="Volume">
                <PropertySlider
                  value={properties.volume}
                  min={0}
                  max={200}
                  onChange={(v) => updateProperty('volume', v)}
                  unit="%"
                />
              </PropertyGroup>

              <PropertyGroup label="Pan">
                <PropertySlider
                  value={properties.pan}
                  min={-100}
                  max={100}
                  onChange={(v) => updateProperty('pan', v)}
                  unit=""
                />
              </PropertyGroup>

              <PropertyGroup label="Options">
                <label className="property-checkbox">
                  <input
                    type="checkbox"
                    checked={properties.mute}
                    onChange={(e) => updateProperty('mute', e.target.checked)}
                  />
                  <span>Mute</span>
                </label>
              </PropertyGroup>
            </div>
          )}
        </div>

        {/* AI Tools */}
        <div className="inspector-section inspector-section--ai">
          <div
            className="inspector-section__header"
            onClick={() => toggleSection('ai')}
          >
            <span className="inspector-section__toggle">
              {expandedSections.has('ai') ? '▼' : '▶'}
            </span>
            <span className="inspector-section__title">🤖 AI Tools</span>
          </div>

          {expandedSections.has('ai') && (
            <div className="inspector-section__content">
              <button className="ai-action-btn">
                🎯 Auto-Reframe for Social Media
              </button>
              <button className="ai-action-btn">🎨 Auto Color Grade</button>
              <button className="ai-action-btn">🔊 Enhance Audio</button>
              <button className="ai-action-btn">✨ Stabilize Footage</button>
              <button className="ai-action-btn">⬆️ Upscale to 4K</button>
              <button className="ai-action-btn">🗑️ Remove Background</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
interface PropertyGroupProps {
  label: string;
  children: React.ReactNode;
}

const PropertyGroup: React.FC<PropertyGroupProps> = ({ label, children }) => {
  return (
    <div className="property-group">
      <label className="property-group__label">{label}</label>
      <div className="property-group__content">{children}</div>
    </div>
  );
};

interface PropertyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const PropertyInput: React.FC<PropertyInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="property-input">
      <label className="property-input__label">{label}</label>
      <input
        type="number"
        className="property-input__field"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

interface PropertySliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit: string;
}

const PropertySlider: React.FC<PropertySliderProps> = ({
  value,
  min,
  max,
  onChange,
  unit,
}) => {
  return (
    <div className="property-slider">
      <input
        type="range"
        className="property-slider__range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="property-slider__value">
        {value}
        {unit}
      </div>
    </div>
  );
};
