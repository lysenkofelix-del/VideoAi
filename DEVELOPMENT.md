# 🛠️ Development Guide - AI Video Editor

## Current Implementation Status

### ✅ Phase 1: Complete (Base Structure)
- [x] Project structure with Electron + React + TypeScript
- [x] Configuration files (package.json, tsconfig, vite.config)
- [x] Shared types system
- [x] Zustand stores (media, timeline)
- [x] MediaPool component with numbering system
- [x] Timeline component (skeleton)
- [x] Preview component (skeleton)
- [x] AI Assistant component (UI)
- [x] Main application layout

## 📋 Next Steps (Phase 2)

### Priority 1: Core Functionality

#### 1. Implement Drag & Drop
**File:** `src/renderer/components/MediaPool/MediaPool.tsx`, `src/renderer/components/Timeline/Timeline.tsx`

```typescript
// In Timeline.tsx - handleDrop function
const handleDrop = (e: React.DragEvent, trackId: string) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData('application/json'));

  if (data.type === 'media-item') {
    const media = getMediaById(data.mediaId);
    const dropPosition = calculateDropPosition(e.clientX);

    addClip({
      mediaId: media.id,
      mediaNumber: media.displayNumber,
      trackId: trackId,
      startTime: dropPosition,
      duration: media.duration || 5000,
      inPoint: 0,
      outPoint: media.duration || 5000,
    });
  }
};
```

#### 2. Implement FFmpeg Integration
**File:** `src/renderer/services/ffmpeg/FFmpegService.ts`

Create a service to:
- Generate thumbnails for video files
- Extract video metadata (duration, resolution, codec)
- Handle video export/rendering

```typescript
import ffmpeg from 'fluent-ffmpeg';

export class FFmpegService {
  async generateThumbnail(videoPath: string): Promise<string> {
    // Generate thumbnail at 1 second mark
    // Return base64 or file path
  }

  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    // Extract duration, resolution, codec info
  }

  async exportVideo(project: Project, settings: ExportSettings): Promise<string> {
    // Build complex ffmpeg command from timeline
    // Include transitions, effects, audio mixing
  }
}
```

#### 3. Implement Video Playback
**File:** `src/renderer/components/Preview/Preview.tsx`

```typescript
// Use HTML5 Video API or Canvas rendering
const handlePlay = () => {
  // Composite all clips at current timeline position
  // Render to canvas or video element
};
```

#### 4. Claude API Integration
**File:** `src/renderer/services/ai/AIEditorService.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class AIEditorService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async parseUserCommand(input: string, context: ProjectContext): Promise<AICommand[]> {
    const systemPrompt = this.buildSystemPrompt(context);

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: input
      }]
    });

    // Parse response and extract commands
    return this.extractCommands(message.content);
  }
}
```

### Priority 2: Timeline Enhancements

#### 5. Clip Manipulation
- Trimming (drag handles at clip edges)
- Moving (drag clip to new position)
- Splitting (cut at playhead)
- Ripple delete (close gaps)

#### 6. Multi-track Support
- Add/remove tracks dynamically
- Lock/unlock tracks
- Solo/mute audio tracks

### Priority 3: Effects System

#### 7. Implement Effect Pipeline
**File:** `src/renderer/services/effects/EffectService.ts`

```typescript
export class EffectService {
  applyEffect(clip: Clip, effect: Effect): ImageData {
    switch (effect.type) {
      case 'brightness':
        return this.applyBrightness(clip, effect.parameters);
      case 'blur':
        return this.applyBlur(clip, effect.parameters);
      // ... more effects
    }
  }
}
```

## 🏗️ Architecture Details

### State Management Flow

```
User Action
    ↓
Component Handler
    ↓
Zustand Store Action
    ↓
State Update
    ↓
Component Re-render
```

### AI Command Flow

```
User Types Command
    ↓
AI Service (Claude API)
    ↓
Parse Command → AICommand[]
    ↓
Generate Preview
    ↓
User Confirms
    ↓
Execute Commands
    ↓
Update Timeline Store
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Package as Electron app
npm run package
```

## 📝 Code Style Guidelines

### TypeScript
- Use explicit types for function parameters and return values
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values

### React Components
- Functional components with hooks
- Props interface defined above component
- CSS modules or separate .css files

### State Management
- Keep stores focused (media, timeline, project, etc.)
- Actions should be atomic and reversible for undo/redo

## 🎯 Testing Strategy

### Unit Tests (TODO)
- Service layer (AI, FFmpeg)
- Store actions
- Utility functions

### Integration Tests (TODO)
- Drag & drop workflow
- AI command execution
- Video export pipeline

### E2E Tests (TODO)
- Full editing workflow
- Import → Edit → Export

## 🚀 Performance Considerations

### Timeline Rendering
- Use Canvas/PixiJS for efficient rendering of many clips
- Virtualize track list for projects with 100+ tracks
- Debounce zoom/scroll operations

### Video Preview
- Implement frame caching
- Use Web Workers for video processing
- Hardware acceleration where possible

### Media Library
- Lazy load thumbnails
- Virtual scrolling for large media pools
- Index media files for fast search

## 🔐 Security Notes

### API Keys
- Never commit API keys to repository
- Store in electron-store or environment variables
- Prompt user to enter on first launch

### File System Access
- Validate all file paths
- Sandbox file operations
- Handle permissions properly

## 📚 Resources

### Required Reading
- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [PixiJS Guide](https://pixijs.com/guides)
- [FFmpeg Filters](https://ffmpeg.org/ffmpeg-filters.html)
- [Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

### Helpful Libraries
- `fluent-ffmpeg` - FFmpeg wrapper
- `@anthropic-ai/sdk` - Claude API client
- `pixi.js` - Canvas rendering
- `tone.js` - Audio processing
- `uuid` - ID generation

## 🐛 Known Issues / TODOs

1. **FFmpeg Integration**: Need to bundle FFmpeg binaries or download on first run
2. **Thumbnail Generation**: Currently using file path as placeholder
3. **Video Playback**: Need to implement actual video compositing
4. **AI Service**: Mock implementation, needs real Claude API integration
5. **Undo/Redo**: Need to implement command pattern
6. **Auto-save**: Need to implement project auto-save
7. **Export**: Need to implement FFmpeg export pipeline

## 💡 Feature Ideas (Future Phases)

### Phase 3: Advanced Features
- [ ] Keyframe animation system
- [ ] Audio waveform visualization
- [ ] Color grading tools
- [ ] Motion tracking
- [ ] Green screen / chroma key

### Phase 4: AI Features
- [ ] Automatic scene detection
- [ ] Speech-to-text transcription
- [ ] Auto-generate B-roll suggestions
- [ ] Smart object tracking
- [ ] Style transfer effects

### Phase 5: Collaboration
- [ ] Cloud project sync
- [ ] Real-time collaboration
- [ ] Version control for projects
- [ ] Comment/annotation system

## 🎓 Learning Resources

If you're new to:
- **Electron**: Start with [Electron Fiddle](https://www.electronjs.org/fiddle)
- **Video Processing**: Learn [FFmpeg basics](https://ffmpeg.org/ffmpeg.html)
- **Canvas Rendering**: Try [PixiJS tutorials](https://pixijs.com/tutorials)
- **AI Integration**: Read [Claude API quickstart](https://docs.anthropic.com/claude/docs/quickstart-guide)

---

Happy coding! 🚀
