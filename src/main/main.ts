/**
 * Electron Main Process
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Import media files
ipcMain.handle('dialog:openFile', async (_, options) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Media Files',
        extensions: [
          'mp4',
          'mov',
          'avi',
          'mkv',
          'webm',
          'jpg',
          'jpeg',
          'png',
          'gif',
          'mp3',
          'wav',
          'aac',
        ],
      },
    ],
    ...options,
  });

  return result;
});

// Save/Load project
ipcMain.handle('dialog:saveFile', async (_, options) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'AI Video Project', extensions: ['aivp'] }],
    ...options,
  });

  return result;
});

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('fs:writeFile', async (_, filePath: string, data: string) => {
  try {
    await fs.writeFile(filePath, data, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Get file metadata
ipcMain.handle('fs:getMetadata', async (_, filePath: string) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      success: true,
      data: {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// FFmpeg operations (will be implemented later)
ipcMain.handle('ffmpeg:getMetadata', async (_, filePath: string) => {
  // TODO: Implement using fluent-ffmpeg
  return { success: true, data: {} };
});

ipcMain.handle('ffmpeg:generateThumbnail', async (_, filePath: string) => {
  // TODO: Implement thumbnail generation
  return { success: true, data: '' };
});

ipcMain.handle('ffmpeg:export', async (_, options) => {
  // TODO: Implement video export
  return { success: true };
});
