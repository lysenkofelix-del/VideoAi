/**
 * Timeline Component - Video editing timeline
 */

import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useMediaStore } from '../../stores/mediaStore';
import './Timeline.css';

export const Timeline: React.FC = () => {
  const { tracks, cursor, zoom, duration, setCursor, setZoom, addClip } = useTimelineStore();
  const { getMediaById } = useMediaStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);

  const calculateDropPosition = (clientX: number): number => {
    if (!tracksContainerRef.current) return 0;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left + tracksContainerRef.current.scrollLeft;
    return Math.max(0, (offsetX / zoom) * 1000);
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));

    if (data.type === 'media-item') {
      const media = getMediaById(data.mediaId);
      if (!media) return;

      const dropPosition = calculateDropPosition(e.clientX);
      const clipDuration = media.duration || 5000; // Default 5 seconds for images

      addClip({
        mediaId: media.id,
        mediaNumber: media.displayNumber,
        trackId: trackId,
        startTime: dropPosition,
        duration: clipDuration,
        inPoint: 0,
        outPoint: clipDuration,
      });

      console.log(`✅ Added clip #${media.displayNumber} to ${trackId} at ${formatTime(dropPosition)}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="timeline">
      <div className="timeline__header">
        <div className="timeline__controls">
          <button className="timeline__btn" title="Воспроизведение">
            ▶️
          </button>
          <button className="timeline__btn" title="Пауза">
            ⏸️
          </button>
          <button className="timeline__btn" title="Стоп">
            ⏹️
          </button>
          <div className="timeline__timecode">{formatTime(cursor)}</div>
        </div>

        <div className="timeline__zoom">
          <button className="timeline__btn" onClick={handleZoomOut} title="Уменьшить">
            −
          </button>
          <input
            type="range"
            className="timeline__zoom-slider"
            min="10"
            max="500"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <button className="timeline__btn" onClick={handleZoomIn} title="Увеличить">
            +
          </button>
          <span className="timeline__zoom-label">{Math.round(zoom)}px/s</span>
        </div>
      </div>

      <div className="timeline__content">
        <div className="timeline__track-headers">
          {tracks.map((track) => (
            <div key={track.id} className="track-header">
              <div className="track-header__name">{track.name}</div>
              <div className="track-header__controls">
                <button
                  className={`track-header__btn ${!track.visible ? 'active' : ''}`}
                  title={track.visible ? 'Скрыть' : 'Показать'}
                >
                  👁
                </button>
                <button
                  className={`track-header__btn ${track.locked ? 'active' : ''}`}
                  title={track.locked ? 'Разблокировать' : 'Заблокировать'}
                >
                  🔒
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="timeline__tracks-container" ref={tracksContainerRef}>
          <div className="timeline__ruler">
            {/* TODO: Render time ruler */}
            <div className="timeline__ruler-inner" style={{ width: `${duration * zoom / 1000}px` }}>
              {Array.from({ length: Math.ceil(duration / 1000) }).map((_, i) => (
                <div
                  key={i}
                  className="timeline__ruler-mark"
                  style={{ left: `${i * zoom}px` }}
                >
                  {formatTime(i * 1000)}
                </div>
              ))}
            </div>
          </div>

          <div className="timeline__tracks">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`timeline__track timeline__track--${track.type}`}
                onDrop={(e) => handleDrop(e, track.id)}
                onDragOver={handleDragOver}
              >
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="timeline__clip"
                    style={{
                      left: `${(clip.startTime * zoom) / 1000}px`,
                      width: `${(clip.duration * zoom) / 1000}px`,
                    }}
                  >
                    <div className="timeline__clip-content">
                      <span className="timeline__clip-number">#{clip.mediaNumber}</span>
                      <span className="timeline__clip-duration">
                        {formatTime(clip.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Cursor */}
          <div
            className="timeline__cursor"
            style={{ left: `${(cursor * zoom) / 1000}px` }}
          />
        </div>
      </div>
    </div>
  );
};
