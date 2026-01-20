/**
 * Essential Graphics - Title/Text creation panel (like Premiere Pro)
 */

import React, { useState } from 'react';
import './EssentialGraphics.css';

export const EssentialGraphics: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [text, setText] = useState('Your Title Here');
  const [fontSize, setFontSize] = useState(72);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#ffffff');

  const titleTemplates = [
    { id: 'lower_third', name: 'Lower Third', preview: '📺' },
    { id: 'title_intro', name: 'Intro Title', preview: '🎬' },
    { id: 'subtitle', name: 'Subtitle', preview: '💬' },
    { id: 'end_credits', name: 'End Credits', preview: '🎭' },
    { id: 'overlay', name: 'Text Overlay', preview: '📝' },
  ];

  const aiGenerate = () => {
    // TODO: Call AI to generate title based on video content
    alert('AI сгенерирует подходящий титр на основе контента видео');
  };

  return (
    <div className="essential-graphics">
      <div className="essential-graphics__header">
        <h3 className="essential-graphics__title">Essential Graphics</h3>
        <button className="btn btn--small btn--ai" onClick={aiGenerate}>
          🤖 AI Generate
        </button>
      </div>

      <div className="essential-graphics__templates">
        <h4 className="section-title">Templates</h4>
        <div className="templates-grid">
          {titleTemplates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'template-card--active' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="template-card__preview">{template.preview}</div>
              <div className="template-card__name">{template.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="essential-graphics__editor">
        <h4 className="section-title">Text</h4>
        <textarea
          className="text-editor"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />

        <h4 className="section-title">Font</h4>
        <select
          className="control-select"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Impact">Impact</option>
        </select>

        <div className="control-row">
          <div className="control-group">
            <label>Size</label>
            <input
              type="number"
              className="control-input"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Color</label>
            <input
              type="color"
              className="control-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn--primary" style={{ width: '100%', marginTop: '16px' }}>
          Add to Timeline
        </button>
      </div>
    </div>
  );
};
