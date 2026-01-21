/**
 * Preview Component - Video preview window with real playback
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useMediaStore } from '../../stores/mediaStore';
import { videoPlayerService } from '../../services/video/VideoPlayerService';
import './Preview.css';

export const Preview: React.FC = () => {
  // Use selectors with shallow compare to avoid unnecessary re-renders
  const cursor = useTimelineStore((state) => state.cursor);
  const duration = useTimelineStore((state) => state.duration);
  const tracks = useTimelineStore((state) => state.tracks);
  const setCursor = useTimelineStore((state) => state.setCursor);
  const mediaItems = useMediaStore((state) => state.mediaItems);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [quality, setQuality] = useState<'full' | 'half' | 'quarter'>('full');

  // Refs to access current values without triggering re-renders
  const tracksRef = useRef(tracks);
  const mediaItemsRef = useRef(mediaItems);
  const cursorRef = useRef(cursor);
  const isPlayingRef = useRef(isPlaying);
  const lastCursorUpdateFromService = useRef<number>(0);
  const renderScheduledRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    tracksRef.current = tracks;
    mediaItemsRef.current = mediaItems;
    cursorRef.current = cursor;
    isPlayingRef.current = isPlaying;
  }, [tracks, mediaItems, cursor, isPlaying]);

  // Centralized render function - SINGLE source of truth
  const scheduleRender = useCallback(() => {
    if (renderScheduledRef.current) return;

    renderScheduledRef.current = true;
    requestAnimationFrame(() => {
      renderScheduledRef.current = false;
      videoPlayerService.renderFrame(
        tracksRef.current,
        mediaItemsRef.current,
        cursorRef.current
      );
    });
  }, []);

  // Initialize video player (only once)
  useEffect(() => {
    if (canvasRef.current) {
      videoPlayerService.init(canvasRef.current);
      videoPlayerService.loadTimeline(tracks, mediaItems, duration);

      // Subscribe to time updates from video player
      const unsubscribe = videoPlayerService.onTimeUpdate((time) => {
        lastCursorUpdateFromService.current = Date.now();
        setCursor(time);
      });

      // Initial render
      scheduleRender();

      return () => {
        unsubscribe();
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync cursor to video player service (when user drags timeline)
  useEffect(() => {
    const now = Date.now();
    if (now - lastCursorUpdateFromService.current > 100) {
      videoPlayerService.seek(cursor);
      if (!isPlaying) {
        scheduleRender();
      }
    }
  }, [cursor, isPlaying, scheduleRender]);

  // Reload timeline when tracks/media/duration change
  useEffect(() => {
    console.log('[Preview] Timeline changed - reloading');
    videoPlayerService.loadTimeline(tracks, mediaItems, duration);
    videoPlayerService.setDuration(duration);
    scheduleRender();
  }, [tracks, mediaItems, duration, scheduleRender]);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      let animationId: number;
      const renderLoop = () => {
        if (!isPlayingRef.current) return;

        videoPlayerService.renderFrame(
          tracksRef.current,
          mediaItemsRef.current,
          cursorRef.current
        );
        animationId = requestAnimationFrame(renderLoop);
      };
      animationId = requestAnimationFrame(renderLoop);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [isPlaying]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (isPlaying) {
      videoPlayerService.pause();
      setIsPlaying(false);
    } else {
      videoPlayerService.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    videoPlayerService.stop();
    setIsPlaying(false);
  };

  const handleSeekToStart = () => {
    videoPlayerService.seek(0);
  };

  const handleSeekToEnd = () => {
    videoPlayerService.seek(duration);
  };

  const handleStepBackward = () => {
    videoPlayerService.stepBackward();
  };

  const handleStepForward = () => {
    videoPlayerService.stepForward();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    videoPlayerService.seek(newTime);
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

          {/* Play overlay when paused */}
          {!isPlaying && (
            <div className="preview__overlay" onClick={handlePlay}>
              <button className="preview__play-btn">▶️</button>
            </div>
          )}

          {/* Safe zones overlay */}
          {showSafeZones && (
            <div className="preview__safe-zones">
              <div className="preview__safe-zone preview__safe-zone--action" />
              <div className="preview__safe-zone preview__safe-zone--title" />
            </div>
          )}
        </div>

        <div className="preview__controls">
          <div className="preview__playback">
            <button className="preview__control-btn" title="К началу" onClick={handleSeekToStart}>
              ⏮️
            </button>
            <button className="preview__control-btn" title="Назад на кадр" onClick={handleStepBackward}>
              ◀️
            </button>
            <button className="preview__control-btn preview__control-btn--play" title={isPlaying ? "Пауза" : "Воспроизведение"} onClick={handlePlay}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="preview__control-btn" title="Вперёд на кадр" onClick={handleStepForward}>
              ▶️
            </button>
            <button className="preview__control-btn" title="К концу" onClick={handleSeekToEnd}>
              ⏭️
            </button>
            <button className="preview__control-btn" title="Стоп" onClick={handleStop}>
              ⏹️
            </button>
          </div>

          <div className="preview__timeline-mini">
            <div className="preview__progress-bar" onClick={handleProgressClick}>
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
          <select
            className="preview__select"
            value={quality}
            onChange={(e) => setQuality(e.target.value as 'full' | 'half' | 'quarter')}
          >
            <option value="full">Полное (100%)</option>
            <option value="half">Половина (50%)</option>
            <option value="quarter">Четверть (25%)</option>
          </select>
        </div>

        <div className="preview__options">
          <label className="preview__checkbox">
            <input
              type="checkbox"
              checked={showSafeZones}
              onChange={(e) => setShowSafeZones(e.target.checked)}
            />
            <span>Показывать безопасные зоны</span>
          </label>
        </div>
      </div>
    </div>
  );
};
