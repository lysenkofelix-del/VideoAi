/**
 * Media Store - Zustand store for media management
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MediaItem, MediaType, MediaSearchQuery } from '@shared/types';

/**
 * Get media duration using HTML5 media element
 */
async function getMediaDuration(filePath: string, type: 'video' | 'audio'): Promise<number> {
  return new Promise((resolve, reject) => {
    const element = type === 'video'
      ? document.createElement('video')
      : document.createElement('audio');

    element.preload = 'metadata';

    element.onloadedmetadata = () => {
      const durationMs = Math.floor(element.duration * 1000);
      element.remove(); // Clean up

      if (isFinite(durationMs) && durationMs > 0) {
        resolve(durationMs);
      } else {
        reject(new Error('Invalid duration'));
      }
    };

    element.onerror = () => {
      element.remove();
      reject(new Error('Failed to load media'));
    };

    // Set timeout to prevent hanging
    setTimeout(() => {
      element.remove();
      reject(new Error('Timeout loading media'));
    }, 10000); // 10 second timeout

    element.src = filePath;
  });
}

interface MediaState {
  mediaItems: MediaItem[];
  selectedMedia: string[];
  nextDisplayNumber: number;

  // Actions
  addMedia: (files: string[]) => Promise<void>;
  removeMedia: (id: string) => void;
  selectMedia: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  searchMedia: (query: MediaSearchQuery) => MediaItem[];
  getMediaByNumber: (number: number) => MediaItem | undefined;
  getMediaById: (id: string) => MediaItem | undefined;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaItems: [],
  selectedMedia: [],
  nextDisplayNumber: 1,

  addMedia: async (filePaths: string[]) => {
    const state = get();
    const newItems: MediaItem[] = [];

    for (const filePath of filePaths) {
      // Determine media type from extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      let type: MediaType = 'video';

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) {
        type = 'image';
      } else if (['mp3', 'wav', 'aac', 'ogg'].includes(ext || '')) {
        type = 'audio';
      }

      // Get file metadata
      const metadataResult = await window.electronAPI.getMetadata(filePath);
      const metadata = metadataResult.success ? metadataResult.data : {};

      // Generate thumbnail (placeholder for now)
      let thumbnail = '';
      if (type === 'video' || type === 'image') {
        // TODO: Generate actual thumbnail
        thumbnail = filePath; // Use file path as placeholder
      }

      // Get video/audio duration using HTML5 media element
      let duration: number | undefined;
      if (type === 'video' || type === 'audio') {
        try {
          duration = await getMediaDuration(filePath, type);
        } catch (error) {
          console.error('Failed to get media duration:', error);
          // Fallback to default duration
          duration = type === 'image' ? 5000 : undefined;
        }
      } else if (type === 'image') {
        // Images default to 5 seconds
        duration = 5000;
      }

      const mediaItem: MediaItem = {
        id: uuidv4(),
        displayNumber: state.nextDisplayNumber,
        type,
        name: filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown',
        path: filePath,
        thumbnail,
        duration,
        metadata: {
          fileSize: metadata.size || 0,
          createdAt: metadata.createdAt ? new Date(metadata.createdAt) : new Date(),
          modifiedAt: metadata.modifiedAt ? new Date(metadata.modifiedAt) : new Date(),
        },
      };

      newItems.push(mediaItem);
      state.nextDisplayNumber++;
    }

    set({
      mediaItems: [...state.mediaItems, ...newItems],
      nextDisplayNumber: state.nextDisplayNumber,
    });
  },

  removeMedia: (id: string) => {
    const state = get();
    set({
      mediaItems: state.mediaItems.filter((item) => item.id !== id),
      selectedMedia: state.selectedMedia.filter((selectedId) => selectedId !== id),
    });
  },

  selectMedia: (id: string, multi = false) => {
    const state = get();
    if (multi) {
      const isSelected = state.selectedMedia.includes(id);
      set({
        selectedMedia: isSelected
          ? state.selectedMedia.filter((selectedId) => selectedId !== id)
          : [...state.selectedMedia, id],
      });
    } else {
      set({ selectedMedia: [id] });
    }
  },

  clearSelection: () => {
    set({ selectedMedia: [] });
  },

  searchMedia: (query: MediaSearchQuery) => {
    const state = get();
    let results = [...state.mediaItems];

    if (query.text) {
      const searchText = query.text.toLowerCase();

      // Check if searching by number (e.g., "#5" or "5")
      const numberMatch = searchText.match(/^#?(\d+)$/);
      if (numberMatch) {
        const number = parseInt(numberMatch[1], 10);
        results = results.filter((item) => item.displayNumber === number);
      } else {
        // Search by name
        results = results.filter((item) => item.name.toLowerCase().includes(searchText));
      }
    }

    if (query.type) {
      results = results.filter((item) => item.type === query.type);
    }

    if (query.number !== undefined) {
      results = results.filter((item) => item.displayNumber === query.number);
    }

    return results;
  },

  getMediaByNumber: (number: number) => {
    const state = get();
    return state.mediaItems.find((item) => item.displayNumber === number);
  },

  getMediaById: (id: string) => {
    const state = get();
    return state.mediaItems.find((item) => item.id === id);
  },
}));
