/**
 * Export Dialog - Export/Render video with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useMediaStore } from '../../stores/mediaStore';
import { ffmpegService, ExportOptions, RenderProgress } from '../../services/video/FFmpegService';
import './ExportDialog.css';

interface ExportDialogProps {
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const { tracks, duration } = useTimelineStore();
  const { mediaItems } = useMediaStore();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp4',
    codec: 'h264',
    resolution: {
      width: 1920,
      height: 1080,
    },
    frameRate: 30,
    bitrate: 8000,
    quality: 'high',
    audioCodec: 'aac',
    audioBitrate: 192,
  });

  const [outputPath, setOutputPath] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<RenderProgress | null>(null);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    // Set default output path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    setOutputPath(`export_${timestamp}.mp4`);
  }, []);

  const handleExport = async () => {
    if (!outputPath.trim()) {
      setExportError('Please enter an output filename');
      return;
    }

    setIsExporting(true);
    setExportProgress(null);
    setExportError(null);

    try {
      // Get all clips from all tracks
      const allClips = tracks.flatMap((track) => track.clips);

      if (allClips.length === 0) {
        setExportError('No clips to export');
        setIsExporting(false);
        return;
      }

      // Start render
      const result = await ffmpegService.renderTimeline(
        allClips,
        mediaItems,
        exportOptions,
        outputPath,
        (progress) => {
          setExportProgress(progress);
        }
      );

      console.log('✅ Export complete:', result);
      setExportComplete(true);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    if (isExporting && exportProgress) {
      // Cancel render (not implemented in mock)
      setIsExporting(false);
    } else {
      onClose();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityBitrate = (quality: string): number => {
    switch (quality) {
      case 'ultra':
        return 16000;
      case 'high':
        return 8000;
      case 'medium':
        return 4000;
      case 'low':
        return 2000;
      default:
        return 8000;
    }
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high' | 'ultra') => {
    setExportOptions({
      ...exportOptions,
      quality,
      bitrate: getQualityBitrate(quality),
    });
  };

  return (
    <div className="export-dialog-overlay" onClick={handleCancel}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="export-dialog__header">
          <h2 className="export-dialog__title">
            {isExporting ? '🎬 Экспорт видео...' : '📤 Экспорт видео'}
          </h2>
          <button className="export-dialog__close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        {!isExporting && !exportComplete && (
          <div className="export-dialog__content">
            <div className="export-dialog__section">
              <label className="export-dialog__label">Имя файла:</label>
              <input
                type="text"
                className="export-dialog__input"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="export.mp4"
              />
            </div>

            <div className="export-dialog__section">
              <label className="export-dialog__label">Формат:</label>
              <select
                className="export-dialog__select"
                value={exportOptions.format}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    format: e.target.value as any,
                  })
                }
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="mov">MOV (QuickTime)</option>
                <option value="webm">WebM</option>
                <option value="avi">AVI</option>
              </select>
            </div>

            <div className="export-dialog__section">
              <label className="export-dialog__label">Разрешение:</label>
              <select
                className="export-dialog__select"
                value={`${exportOptions.resolution.width}x${exportOptions.resolution.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  setExportOptions({
                    ...exportOptions,
                    resolution: { width, height },
                  });
                }}
              >
                <option value="3840x2160">4K (3840×2160)</option>
                <option value="1920x1080">Full HD (1920×1080)</option>
                <option value="1280x720">HD (1280×720)</option>
                <option value="854x480">SD (854×480)</option>
              </select>
            </div>

            <div className="export-dialog__section">
              <label className="export-dialog__label">Частота кадров:</label>
              <select
                className="export-dialog__select"
                value={exportOptions.frameRate}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    frameRate: Number(e.target.value),
                  })
                }
              >
                <option value="24">24 fps (Cinema)</option>
                <option value="30">30 fps</option>
                <option value="60">60 fps (Smooth)</option>
              </select>
            </div>

            <div className="export-dialog__section">
              <label className="export-dialog__label">Качество:</label>
              <div className="export-dialog__quality-buttons">
                {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
                  <button
                    key={q}
                    className={`export-dialog__quality-btn ${exportOptions.quality === q ? 'active' : ''}`}
                    onClick={() => handleQualityChange(q)}
                  >
                    {q === 'low' && 'Низкое'}
                    {q === 'medium' && 'Среднее'}
                    {q === 'high' && 'Высокое'}
                    {q === 'ultra' && 'Ультра'}
                  </button>
                ))}
              </div>
              <div className="export-dialog__quality-info">
                Битрейт: {exportOptions.bitrate} kbps
              </div>
            </div>

            <div className="export-dialog__section">
              <label className="export-dialog__label">Аудио кодек:</label>
              <select
                className="export-dialog__select"
                value={exportOptions.audioCodec}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    audioCodec: e.target.value as any,
                  })
                }
              >
                <option value="aac">AAC</option>
                <option value="mp3">MP3</option>
                <option value="opus">Opus</option>
              </select>
            </div>

            <div className="export-dialog__info">
              <div className="export-dialog__info-item">
                <span className="export-dialog__info-label">Длительность:</span>
                <span className="export-dialog__info-value">
                  {formatTime(duration / 1000)}
                </span>
              </div>
              <div className="export-dialog__info-item">
                <span className="export-dialog__info-label">Клипов:</span>
                <span className="export-dialog__info-value">
                  {tracks.reduce((sum, track) => sum + track.clips.length, 0)}
                </span>
              </div>
            </div>

            {exportError && (
              <div className="export-dialog__error">❌ {exportError}</div>
            )}
          </div>
        )}

        {isExporting && exportProgress && (
          <div className="export-dialog__progress">
            <div className="export-dialog__progress-bar">
              <div
                className="export-dialog__progress-fill"
                style={{ width: `${exportProgress.percentage}%` }}
              />
            </div>
            <div className="export-dialog__progress-info">
              <div className="export-dialog__progress-text">
                Кадр {exportProgress.currentFrame} из {exportProgress.totalFrames}
              </div>
              <div className="export-dialog__progress-percent">
                {exportProgress.percentage.toFixed(1)}%
              </div>
            </div>
            <div className="export-dialog__progress-time">
              Осталось: {formatTime(exportProgress.timeRemaining)}
            </div>
          </div>
        )}

        {exportComplete && (
          <div className="export-dialog__complete">
            <div className="export-dialog__complete-icon">✅</div>
            <div className="export-dialog__complete-title">Экспорт завершен!</div>
            <div className="export-dialog__complete-path">{outputPath}</div>
          </div>
        )}

        <div className="export-dialog__footer">
          {!isExporting && !exportComplete && (
            <>
              <button className="export-dialog__btn export-dialog__btn--secondary" onClick={handleCancel}>
                Отмена
              </button>
              <button className="export-dialog__btn export-dialog__btn--primary" onClick={handleExport}>
                Экспортировать
              </button>
            </>
          )}

          {isExporting && (
            <button className="export-dialog__btn export-dialog__btn--secondary" onClick={handleCancel}>
              Отменить рендер
            </button>
          )}

          {exportComplete && (
            <button className="export-dialog__btn export-dialog__btn--primary" onClick={onClose}>
              Закрыть
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
