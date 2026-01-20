/**
 * MediaPool Component - Media library with numbering system for AI
 */

import React, { useState } from 'react';
import { useMediaStore } from '../../stores/mediaStore';
import { MediaItem as MediaItemType } from '@shared/types';
import { MEDIA_TYPE_ICONS } from '@shared/constants';
import './MediaPool.css';

export const MediaPool: React.FC = () => {
  const { mediaItems, selectedMedia, addMedia, selectMedia, clearSelection, searchMedia } =
    useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const displayItems = searchQuery
    ? searchMedia({ text: searchQuery })
    : mediaItems;

  const handleImport = async () => {
    const result = await window.electronAPI.openFileDialog();
    if (!result.canceled && result.filePaths) {
      await addMedia(result.filePaths);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    selectMedia(id, e.ctrlKey || e.metaKey);
  };

  const handleDragStart = (item: MediaItemType, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'media-item',
        mediaId: item.id,
        mediaNumber: item.displayNumber,
      })
    );
  };

  return (
    <div className="media-pool">
      <div className="media-pool__header">
        <h3 className="media-pool__title">Медиафайлы</h3>
        <div className="media-pool__actions">
          <button className="btn btn--primary" onClick={handleImport}>
            + Импорт
          </button>
          <div className="view-toggle">
            <button
              className={`view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Сетка"
            >
              ▦
            </button>
            <button
              className={`view-toggle__btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Список"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="media-pool__search">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по номеру (#5) или имени..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {selectedMedia.length > 0 && (
          <button className="btn btn--text" onClick={clearSelection}>
            Снять выделение ({selectedMedia.length})
          </button>
        )}
      </div>

      <div className="media-pool__stats">
        <span>{displayItems.length} файлов</span>
        <span>
          {displayItems.filter((i) => i.type === 'video').length} видео /{' '}
          {displayItems.filter((i) => i.type === 'image').length} фото /{' '}
          {displayItems.filter((i) => i.type === 'audio').length} аудио
        </span>
      </div>

      <div className={`media-pool__content media-pool__content--${viewMode}`}>
        {displayItems.length === 0 ? (
          <div className="media-pool__empty">
            <div className="empty-state">
              <div className="empty-state__icon">📁</div>
              <p className="empty-state__title">Нет медиафайлов</p>
              <p className="empty-state__description">
                {searchQuery
                  ? 'Попробуйте изменить запрос поиска'
                  : 'Импортируйте видео, изображения или аудио'}
              </p>
              {!searchQuery && (
                <button className="btn btn--primary" onClick={handleImport}>
                  + Импортировать файлы
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="media-pool__grid">
            {displayItems.map((item) => (
              <MediaItem
                key={item.id}
                item={item}
                isSelected={selectedMedia.includes(item.id)}
                onClick={handleItemClick}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface MediaItemProps {
  item: MediaItemType;
  isSelected: boolean;
  onClick: (id: string, e: React.MouseEvent) => void;
  onDragStart: (item: MediaItemType, e: React.DragEvent) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  item,
  isSelected,
  onClick,
  onDragStart,
}) => {
  const formatDuration = (ms: number | undefined): string => {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div
      className={`media-item ${isSelected ? 'media-item--selected' : ''}`}
      draggable
      onClick={(e) => onClick(item.id, e)}
      onDragStart={(e) => onDragStart(item, e)}
    >
      {/* 🔢 НОМЕР — КРИТИЧЕСКИ ВАЖНО для AI */}
      <div className="media-item__number">{String(item.displayNumber).padStart(3, '0')}</div>

      <div className="media-item__thumbnail">
        {item.type === 'image' || item.type === 'video' ? (
          <img
            src={`file://${item.path}`}
            alt={item.name}
            className="media-item__thumbnail-image"
          />
        ) : (
          <div className="media-item__thumbnail-placeholder">
            <span className="media-item__icon-large">{MEDIA_TYPE_ICONS[item.type]}</span>
          </div>
        )}
        {item.duration && (
          <span className="media-item__duration">{formatDuration(item.duration)}</span>
        )}
      </div>

      <div className="media-item__info">
        <div className="media-item__header">
          <span className="media-item__icon">{MEDIA_TYPE_ICONS[item.type]}</span>
          <span className="media-item__name" title={item.name}>
            {item.name}
          </span>
        </div>
        <div className="media-item__meta">
          <span className="media-item__size">
            {formatFileSize(item.metadata.fileSize)}
          </span>
        </div>
      </div>
    </div>
  );
};
