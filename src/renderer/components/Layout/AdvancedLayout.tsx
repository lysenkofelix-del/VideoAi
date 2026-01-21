/**
 * Advanced Layout - Professional multi-panel layout with workspaces
 */

import React, { useState, useEffect } from 'react';
import { MediaPool } from '../MediaPool/MediaPool';
import { Preview } from '../Preview/Preview';
import { AIAssistant } from '../AIAssistant/AIAssistant';
import { AIMenu } from '../AIMenu/AIMenu';
import { Timeline } from '../Timeline/Timeline';
import { EffectsPanel } from '../Effects/EffectsPanel';
import { ColorPanel } from '../ColorPanel/ColorPanel';
import { Inspector } from '../Inspector/Inspector';
import { EssentialGraphics } from '../EssentialGraphics/EssentialGraphics';
import { Settings } from '../Settings/Settings';
import { FirstRunDialog } from '../FirstRun/FirstRunDialog';
import './AdvancedLayout.css';

type Workspace = 'editing' | 'color' | 'effects' | 'audio' | 'graphics';
type LeftPanelTab = 'media' | 'effects';
type RightPanelTab = 'ai' | 'inspector' | 'color' | 'graphics';

export const AdvancedLayout: React.FC = () => {
  const [workspace, setWorkspace] = useState<Workspace>('editing');
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('media');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('ai');
  const [showSettings, setShowSettings] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(false);

  // Check if first run
  useEffect(() => {
    const firstRunCompleted = localStorage.getItem('first-run-completed');
    if (!firstRunCompleted) {
      setShowFirstRun(true);
    }
  }, []);

  // Menu handlers
  const handleFileMenu = () => {
    // TODO: Implement File menu (New, Open, Save, etc.)
    console.log('File menu clicked');
  };

  const handleEditMenu = () => {
    // TODO: Implement Edit menu (Undo, Redo, Cut, Copy, Paste)
    console.log('Edit menu clicked');
  };

  const handleClipMenu = () => {
    // TODO: Implement Clip menu (Speed, Transform, Audio)
    console.log('Clip menu clicked');
  };

  const handleSequenceMenu = () => {
    // TODO: Implement Sequence menu (Settings, Render)
    console.log('Sequence menu clicked');
  };

  const handleEffectsMenu = () => {
    // Switch to effects workspace
    loadWorkspace('effects');
  };

  const handleExportMenu = async () => {
    // TODO: Implement export dialog
    alert('Функция экспорта будет доступна в следующей версии.\nПока используйте FFmpeg напрямую.');
  };

  const handleHelpMenu = () => {
    // Open API keys guide
    alert('📖 Помощь:\n\n1. Инструкция по API ключам: смотрите файл API_KEYS_GUIDE.md\n2. GitHub: https://github.com/yourusername/VideoAI\n3. Документация Claude: docs.anthropic.com\n4. Документация OpenAI: platform.openai.com/docs');
  };

  // Workspace presets
  const loadWorkspace = (ws: Workspace) => {
    setWorkspace(ws);
    switch (ws) {
      case 'editing':
        setLeftPanelTab('media');
        setRightPanelTab('ai');
        break;
      case 'color':
        setLeftPanelTab('media');
        setRightPanelTab('color');
        break;
      case 'effects':
        setLeftPanelTab('effects');
        setRightPanelTab('inspector');
        break;
      case 'graphics':
        setLeftPanelTab('media');
        setRightPanelTab('graphics');
        break;
    }
  };

  return (
    <div className="advanced-layout">
      <header className="advanced-layout__header">
        <div className="header__left">
          <div className="app-title">
            <span className="app-title__icon">🎬</span>
            <h1 className="app-title__text">AI Video Editor PRO</h1>
          </div>

          {/* Main Menu */}
          <nav className="main-menu">
            <button className="menu__item" onClick={handleFileMenu}>File</button>
            <button className="menu__item" onClick={handleEditMenu}>Edit</button>
            <button className="menu__item" onClick={handleClipMenu}>Clip</button>
            <button className="menu__item" onClick={handleSequenceMenu}>Sequence</button>
            <button className="menu__item" onClick={handleEffectsMenu}>Effects</button>
            <AIMenu
              onOpenAssistant={() => {
                setRightPanelTab('ai');
              }}
            />
            <button className="menu__item" onClick={handleExportMenu}>Export</button>
            <button className="menu__item" onClick={handleHelpMenu}>Help</button>
          </nav>
        </div>

        <div className="header__center">
          {/* Workspaces */}
          <div className="workspaces">
            <button
              className={`workspace-btn ${workspace === 'editing' ? 'workspace-btn--active' : ''}`}
              onClick={() => loadWorkspace('editing')}
            >
              Editing
            </button>
            <button
              className={`workspace-btn ${workspace === 'color' ? 'workspace-btn--active' : ''}`}
              onClick={() => loadWorkspace('color')}
            >
              Color
            </button>
            <button
              className={`workspace-btn ${workspace === 'effects' ? 'workspace-btn--active' : ''}`}
              onClick={() => loadWorkspace('effects')}
            >
              Effects
            </button>
            <button
              className={`workspace-btn ${workspace === 'graphics' ? 'workspace-btn--active' : ''}`}
              onClick={() => loadWorkspace('graphics')}
            >
              Graphics
            </button>
          </div>
        </div>

        <div className="header__right">
          <div className="project-info">
            <span className="project-name">Untitled Project</span>
            <span className="project-save-status" title="Auto-saved">●</span>
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      <div className="advanced-layout__workspace">
        {/* Left Panel with Tabs */}
        <div className="panel panel--left">
          <div className="panel__tabs">
            <button
              className={`panel__tab ${leftPanelTab === 'media' ? 'panel__tab--active' : ''}`}
              onClick={() => setLeftPanelTab('media')}
            >
              📁 Media
            </button>
            <button
              className={`panel__tab ${leftPanelTab === 'effects' ? 'panel__tab--active' : ''}`}
              onClick={() => setLeftPanelTab('effects')}
            >
              ✨ Effects
            </button>
          </div>
          <div className="panel__content">
            {leftPanelTab === 'media' && <MediaPool />}
            {leftPanelTab === 'effects' && <EffectsPanel />}
          </div>
        </div>

        {/* Center Panel */}
        <div className="panel panel--center">
          <div className="center-panel__preview">
            <Preview />
          </div>
          <div className="center-panel__timeline">
            <Timeline />
          </div>
        </div>

        {/* Right Panel with Tabs */}
        <div className="panel panel--right">
          <div className="panel__tabs">
            <button
              className={`panel__tab ${rightPanelTab === 'ai' ? 'panel__tab--active' : ''}`}
              onClick={() => setRightPanelTab('ai')}
              title="AI Assistant"
            >
              🤖
            </button>
            <button
              className={`panel__tab ${rightPanelTab === 'inspector' ? 'panel__tab--active' : ''}`}
              onClick={() => setRightPanelTab('inspector')}
              title="Inspector"
            >
              🎯
            </button>
            <button
              className={`panel__tab ${rightPanelTab === 'color' ? 'panel__tab--active' : ''}`}
              onClick={() => setRightPanelTab('color')}
              title="Color"
            >
              🎨
            </button>
            <button
              className={`panel__tab ${rightPanelTab === 'graphics' ? 'panel__tab--active' : ''}`}
              onClick={() => setRightPanelTab('graphics')}
              title="Graphics"
            >
              📝
            </button>
          </div>
          <div className="panel__content">
            {rightPanelTab === 'ai' && <AIAssistant />}
            {rightPanelTab === 'inspector' && <Inspector />}
            {rightPanelTab === 'color' && <ColorPanel />}
            {rightPanelTab === 'graphics' && <EssentialGraphics />}
          </div>
        </div>
      </div>

      <footer className="advanced-layout__footer">
        <div className="status-bar">
          <span className="status-bar__item">✅ Ready</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">0 clips</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">1920×1080 @ 30fps</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">🤖 AI Ready</span>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item">💾 256 GB free</span>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* First Run Dialog */}
      {showFirstRun && (
        <FirstRunDialog
          onComplete={(skipAI) => {
            setShowFirstRun(false);
            if (skipAI) {
              console.log('User chose to skip AI setup');
            } else {
              console.log('User configured AI');
            }
          }}
        />
      )}
    </div>
  );
};
