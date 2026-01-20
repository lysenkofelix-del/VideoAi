/**
 * Preload Script - Bridge between main and renderer
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFileDialog: (options?: any) => ipcRenderer.invoke('dialog:openFile', options),
  saveFileDialog: (options?: any) => ipcRenderer.invoke('dialog:saveFile', options),

  // File system APIs
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, data: string) =>
    ipcRenderer.invoke('fs:writeFile', filePath, data),
  getMetadata: (filePath: string) => ipcRenderer.invoke('fs:getMetadata', filePath),

  // FFmpeg APIs
  getVideoMetadata: (filePath: string) =>
    ipcRenderer.invoke('ffmpeg:getMetadata', filePath),
  generateThumbnail: (filePath: string) =>
    ipcRenderer.invoke('ffmpeg:generateThumbnail', filePath),
  exportVideo: (options: any) => ipcRenderer.invoke('ffmpeg:export', options),
  getFFmpegPath: () => ipcRenderer.invoke('ffmpeg:getPath'),
  ffmpeg: (options: any) => ipcRenderer.invoke('ffmpeg:process', options),
});

// TypeScript types for the exposed API
export interface ElectronAPI {
  openFileDialog: (options?: any) => Promise<{ canceled: boolean; filePaths?: string[] }>;
  saveFileDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (
    filePath: string,
    data: string
  ) => Promise<{ success: boolean; error?: string }>;
  getMetadata: (
    filePath: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  getVideoMetadata: (filePath: string) => Promise<{ success: boolean; data?: any }>;
  generateThumbnail: (filePath: string) => Promise<{ success: boolean; data?: string }>;
  exportVideo: (options: any) => Promise<{ success: boolean }>;
  getFFmpegPath: () => Promise<string | null>;
  ffmpeg: (options: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
