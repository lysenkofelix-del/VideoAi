/**
 * Timeline Component - Video editing timeline with playback
 */

import React, { useRef, useEffect, useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useMediaStore } from '../../stores/mediaStore';
import { videoPlayerService } from '../../services/video/VideoPlayerService';
import './Timeline.css';

export const Timeline: React.FC = () => {
  const { tracks, cursor, zoom, duration, setCursor, setZoom, addClip, moveClip } = useTimelineStore();
  const { getMediaById } = useMediaStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [draggingClip, setDraggingClip] = useState<string | null>(null);

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

  const handlePlay = () => {
    if (isPlaying) {
      videoPlayerService.pause();
      setIsPlaying(false);
    } else {
      videoPlayerService.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    videoPlayerService.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    videoPlayerService.stop();
    setIsPlaying(false);
  };

  const calculateDropPosition = (clientX: number): number => {
    if (!tracksContainerRef.current) return 0;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left + tracksContainerRef.current.scrollLeft;
    return Math.max(0, (offsetX / zoom) * 1000);
  };

  const handleClipDragStart = (e: React.DragEvent, clipId: string) => {
    e.stopPropagation();
    setDraggingClip(clipId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'timeline-clip', clipId }));
  };

  const handleClipDragEnd = () => {
    setDraggingClip(null);
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const dropPosition = calculateDropPosition(e.clientX);

    if (data.type === 'timeline-clip') {
      // Moving existing clip
      moveClip(data.clipId, trackId, dropPosition);
      console.log(`✅ Moved clip to ${trackId} at ${formatTime(dropPosition)}`);
    } else if (data.type === 'media-item') {
      // Adding new clip from media pool
      const media = getMediaById(data.mediaId);
      if (!media) return;

      // Auto-select correct track based on media type
      let targetTrack = trackId;
      const track = tracks.find(t => t.id === trackId);

      if (track) {
        // Check if media type matches track type
        if (media.type === 'video' && track.type === 'audio') {
          // Video on audio track - move to video track
          const videoTrack = tracks.find(t => t.type === 'video');
          if (videoTrack) targetTrack = videoTrack.id;
        } else if (media.type === 'audio' && track.type === 'video') {
          // Audio on video track - move to audio track
          const audioTrack = tracks.find(t => t.type === 'audio');
          if (audioTrack) targetTrack = audioTrack.id;
        }
      }

      const clipDuration = media.duration || 5000; // Default 5 seconds for images

      addClip({
        mediaId: media.id,
        mediaNumber: media.displayNumber,
        trackId: targetTrack,
        startTime: dropPosition,
        duration: clipDuration,
        inPoint: 0,
        outPoint: clipDuration,
      });

      console.log(`✅ Added ${media.type} clip #${media.displayNumber} to ${targetTrack} at ${formatTime(dropPosition)}, duration: ${formatTime(clipDuration)}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggingClip ? 'move' : 'copy';
  };

  return (
    <div className="timeline">
      <div className="timeline__header">
        <div className="timeline__controls">
          <button
            className={`timeline__btn ${isPlaying ? 'active' : ''}`}
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
            onClick={handlePlay}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            className="timeline__btn"
            title="Стоп"
            onClick={handleStop}
          >
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
                    className={`timeline__clip ${draggingClip === clip.id ? 'timeline__clip--dragging' : ''}`}
                    style={{
                      left: `${(clip.startTime * zoom) / 1000}px`,
                      width: `${(clip.duration * zoom) / 1000}px`,
                    }}
                    draggable
                    onDragStart={(e) => handleClipDragStart(e, clip.id)}
                    onDragEnd={handleClipDragEnd}
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
