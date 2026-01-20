# 🎬 AI Video Editor

Professional video editor with AI-powered assistance built with Electron, React, and TypeScript.

## ✨ Features

### Core Video Editing
- **Non-linear Timeline Editor** - Professional multi-track timeline with drag-and-drop support
- **Media Pool** - Organized media library with unique numbering system for AI commands
- **Real-time Preview** - High-quality video preview with playback controls
- **Effects & Transitions** - Comprehensive library of video effects and transitions
- **Keyframe Animation** - Professional-grade animation system

### AI Assistant 🤖
The standout feature - an integrated AI assistant powered by Claude that understands natural language commands:

#### Example Commands:
```
"Вставь видео #3 в начало таймлайна"
"Добавь плавный переход между #2 и #5"
"Примени эффект Ken Burns к изображениям #2, #5, #9"
"Обрежь клип #4, оставь только с 10 по 25 секунду"
```

The AI assistant can:
- Insert, move, and trim clips by referencing their numbers
- Apply effects and transitions
- Analyze video content
- Suggest optimal cut points
- Generate animations

### Media Numbering System
Every imported file gets a unique number (001, 002, 003...) displayed prominently in yellow. This allows the AI to precisely reference files in commands like "Add #5 after #3".

## 🏗️ Architecture

```
/ai-video-editor
├── /src
│   ├── /main                 # Electron main process
│   ├── /renderer             # React application
│   │   ├── /components
│   │   │   ├── /Timeline     # Multi-track timeline editor
│   │   │   ├── /Preview      # Video preview window
│   │   │   ├── /MediaPool    # Media library with numbering
│   │   │   ├── /AIAssistant  # AI chat interface
│   │   │   └── /Layout       # Main application layout
│   │   ├── /stores           # Zustand state management
│   │   └── /services
│   │       ├── /ffmpeg       # Video processing
│   │       └── /ai           # Claude API integration
│   └── /shared               # Shared types and constants
└── /assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package as desktop app
npm run package
```

## 🎯 Technology Stack

- **Desktop Framework:** Electron
- **Frontend:** React 18 + TypeScript
- **State Management:** Zustand
- **Video Processing:** FFmpeg
- **Canvas Rendering:** PixiJS (for timeline visualization)
- **AI Integration:** Anthropic Claude API
- **Audio:** Web Audio API + Tone.js

## 📋 Current Status

This is Phase 1 implementation with:
- ✅ Base project structure
- ✅ Electron + React + TypeScript setup
- ✅ MediaPool component with numbering system
- ✅ Timeline component (skeleton)
- ✅ Preview component (skeleton)
- ✅ AI Assistant component (UI complete)
- ✅ Zustand stores for state management
- ✅ Main application layout

### Coming in Phase 2:
- Drag & Drop from MediaPool to Timeline
- Video playback in Preview
- FFmpeg integration for video processing
- Actual Claude API integration
- Effects and transitions system

### Coming in Phase 3:
- Keyframe animation system
- Advanced video analysis
- Context-aware AI commands
- Audio visualization

## 🎨 UI Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  File | Edit | Clip | Sequence | Effects | AI | Window | Help       │
├──────────────────────┬──────────────────────┬───────────────────────┤
│                      │                      │                       │
│    MEDIA POOL        │     PREVIEW          │    AI ASSISTANT       │
│    [001] 🎬 clip1    │   ┌─────────────┐    │                       │
│    [002] 🖼️ img1     │   │             │    │   💬 "Вставь #3       │
│    [003] 🎬 clip2    │   │   Preview   │    │   после #1"           │
│    [004] 🎵 music    │   │   Window    │    │                       │
│                      │   └─────────────┘    │   🤖 Понял! ...       │
├──────────────────────┴──────────────────────┴───────────────────────┤
│ TIMELINE                                                             │
│ V1 │[001 clip1]▓▓[003 clip2]    [002 img1]                         │
│ A1 │[004 music════════════════════════════]                         │
└─────────────────────────────────────────────────────────────────────┘
```

## 🤝 Contributing

This is a comprehensive video editor project. Contributions are welcome!

## 📄 License

MIT License

## 🔗 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Anthropic Claude API](https://docs.anthropic.com)
- [FFmpeg](https://ffmpeg.org)

---

Built with ❤️ using Claude AI assistance
