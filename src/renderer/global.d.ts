/**
 * Global TypeScript declarations
 */

interface Window {
  electronAPI: {
    openFileDialog: (options?: any) => Promise<{ canceled: boolean; filePaths?: string[] }>;
    saveFileDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>;
    readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
    getMetadata: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    getVideoMetadata: (filePath: string) => Promise<{ success: boolean; data?: any }>;
    generateThumbnail: (filePath: string) => Promise<{ success: boolean; data?: string }>;
    exportVideo: (options: any) => Promise<{ success: boolean }>;
    getFFmpegPath: () => Promise<string | null>;
    ffmpeg: (options: any) => Promise<any>;
  };

  // Alias for convenience
  electron?: {
    getFFmpegPath: () => Promise<string | null>;
    ffmpeg: (options: any) => Promise<any>;
  };
}
