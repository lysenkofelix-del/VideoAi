/**
 * Main Layout Component - Application layout structure
 */

import React from 'react';
import { MediaPool } from '../MediaPool/MediaPool';
import { Preview } from '../Preview/Preview';
import { AIAssistant } from '../AIAssistant/AIAssistant';
import { Timeline } from '../Timeline/Timeline';
import './Layout.css';

export const Layout: React.FC = () => {
  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__menu">
          <div className="app-title">
            <span className="app-title__icon">🎬</span>
            <h1 className="app-title__text">AI Video Editor</h1>
          </div>
          <nav className="menu">
            <button className="menu__item">File</button>
            <button className="menu__item">Edit</button>
            <button className="menu__item">Clip</button>
            <button className="menu__item">Sequence</button>
            <button className="menu__item">Effects</button>
            <button className="menu__item">AI</button>
            <button className="menu__item">Window</button>
            <button className="menu__item">Help</button>
          </nav>
        </div>
        <div className="layout__project-info">
          <span className="project-name">Untitled Project</span>
          <span className="project-save-status">●</span>
        </div>
      </header>

      <div className="layout__workspace">
        <div className="layout__left-panel">
          <MediaPool />
        </div>

        <div className="layout__center-panel">
          <div className="layout__preview-area">
            <Preview />
          </div>
          <div className="layout__timeline-area">
            <Timeline />
          </div>
        </div>

        <div className="layout__right-panel">
          <AIAssistant />
        </div>
      </div>

      <footer className="layout__footer">
        <div className="status-bar">
          <span className="status-bar__item">Готово к работе</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">0 клипов на таймлайне</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">1920×1080 @ 30fps</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">Свободно: 256 GB</span>
        </div>
      </footer>
    </div>
  );
};
