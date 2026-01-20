/**
 * Preview Component - Video preview window
 */

import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import './Preview.css';

export const Preview: React.FC = () => {
  const { cursor, duration } = useTimelineStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (cursor / duration) * 100 : 0;

  return (
    <div className="preview">
      <div className="preview__header">
        <h3 className="preview__title">Предпросмотр</h3>
        <div className="preview__info">
          <span className="preview__resolution">1920×1080</span>
          <span className="preview__framerate">30 fps</span>
        </div>
      </div>

      <div className="preview__content">
        <div className="preview__viewport">
          <canvas
            ref={canvasRef}
            className="preview__canvas"
            width={1920}
            height={1080}
          />
          <video
            ref={videoRef}
            className="preview__video"
            style={{ display: 'none' }}
          />

          {/* Play overlay when paused */}
          <div className="preview__overlay">
            <button className="preview__play-btn">▶️</button>
          </div>

          {/* Safe zones overlay */}
          <div className="preview__safe-zones">
            <div className="preview__safe-zone preview__safe-zone--action" />
            <div className="preview__safe-zone preview__safe-zone--title" />
          </div>
        </div>

        <div className="preview__controls">
          <div className="preview__playback">
            <button className="preview__control-btn" title="К началу">
              ⏮️
            </button>
            <button className="preview__control-btn" title="Назад на кадр">
              ◀️
            </button>
            <button className="preview__control-btn preview__control-btn--play" title="Воспроизведение">
              ▶️
            </button>
            <button className="preview__control-btn" title="Вперёд на кадр">
              ▶️
            </button>
            <button className="preview__control-btn" title="К концу">
              ⏭️
            </button>
          </div>

          <div className="preview__timeline-mini">
            <div className="preview__progress-bar">
              <div
                className="preview__progress-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="preview__progress-handle"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>

          <div className="preview__timecode">
            <span className="preview__time-current">{formatTime(cursor)}</span>
            <span className="preview__time-separator">/</span>
            <span className="preview__time-total">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="preview__footer">
        <div className="preview__quality">
          <label className="preview__label">Качество:</label>
          <select className="preview__select">
            <option value="full">Полное (100%)</option>
            <option value="half">Половина (50%)</option>
            <option value="quarter">Четверть (25%)</option>
          </select>
        </div>

        <div className="preview__options">
          <label className="preview__checkbox">
            <input type="checkbox" defaultChecked />
            <span>Показывать безопасные зоны</span>
          </label>
        </div>
      </div>
    </div>
  );
};
