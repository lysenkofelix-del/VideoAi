/**
 * Timeline Store - Zustand store for timeline management
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Timeline, Track, Clip, Marker } from '@shared/types';
import { TIMELINE_CONSTANTS } from '@shared/constants';

interface TimelineState extends Timeline {
  // Actions
  addTrack: (type: Track['type']) => void;
  removeTrack: (trackId: string) => void;
  addClip: (clip: Omit<Clip, 'id'>) => Clip; // Now returns the created clip
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  moveClip: (clipId: string, trackId: string, startTime: number) => void;
  setZoom: (zoom: number) => void;
  setCursor: (time: number) => void;
  addMarker: (time: number, label: string) => void;
  removeMarker: (markerId: string) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  tracks: [
    {
      id: 'video-1',
      type: 'video',
      name: 'Video 1',
      clips: [],
      locked: false,
      visible: true,
    },
    {
      id: 'audio-1',
      type: 'audio',
      name: 'Audio 1',
      clips: [],
      locked: false,
      visible: true,
      volume: 1,
    },
  ],
  cursor: 0,
  zoom: TIMELINE_CONSTANTS.DEFAULT_ZOOM,
  selection: [],
  markers: [],
  duration: 0,

  addTrack: (type) => {
    const state = get();
    const trackNumber = state.tracks.filter((t) => t.type === type).length + 1;
    const newTrack: Track = {
      id: uuidv4(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${trackNumber}`,
      clips: [],
      locked: false,
      visible: true,
      ...(type === 'audio' && { volume: 1 }),
    };
    set({ tracks: [...state.tracks, newTrack] });
  },

  removeTrack: (trackId) => {
    const state = get();
    set({ tracks: state.tracks.filter((track) => track.id !== trackId) });
  },

  addClip: (clipData) => {
    const state = get();
    const clip: Clip = {
      ...clipData,
      id: uuidv4(),
      effects: [],
      transitions: {},
      animation: [],
      speed: 1,
      volume: 1,
      opacity: 1,
    };

    const tracks = state.tracks.map((track) =>
      track.id === clip.trackId ? { ...track, clips: [...track.clips, clip] } : track
    );

    // Update total duration
    const maxDuration = Math.max(
      ...tracks.flatMap((track) =>
        track.clips.map((c) => c.startTime + c.duration)
      ),
      0
    );

    set({ tracks, duration: maxDuration });

    // Return the created clip for reference
    return clip;
  },

  removeClip: (clipId) => {
    const state = get();
    const tracks = state.tracks.map((track) => ({
      ...track,
      clips: track.clips.filter((clip) => clip.id !== clipId),
    }));

    const maxDuration = Math.max(
      ...tracks.flatMap((track) =>
        track.clips.map((c) => c.startTime + c.duration)
      ),
      0
    );

    set({ tracks, duration: maxDuration });
  },

  updateClip: (clipId, updates) => {
    const state = get();
    const tracks = state.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) =>
        clip.id === clipId ? { ...clip, ...updates } : clip
      ),
    }));
    set({ tracks });
  },

  moveClip: (clipId, trackId, startTime) => {
    const state = get();
    let clipToMove: Clip | null = null;

    // Find and remove clip from current track
    const tracks = state.tracks.map((track) => {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) {
        clipToMove = clip;
        return {
          ...track,
          clips: track.clips.filter((c) => c.id !== clipId),
        };
      }
      return track;
    });

    // Add clip to new track
    if (clipToMove) {
      const updatedTracks = tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: [...track.clips, { ...clipToMove!, trackId, startTime }],
            }
          : track
      );
      set({ tracks: updatedTracks });
    }
  },

  setZoom: (zoom) => {
    const clampedZoom = Math.max(
      TIMELINE_CONSTANTS.MIN_ZOOM,
      Math.min(TIMELINE_CONSTANTS.MAX_ZOOM, zoom)
    );
    set({ zoom: clampedZoom });
  },

  setCursor: (time) => {
    set({ cursor: Math.max(0, time) });
  },

  addMarker: (time, label) => {
    const state = get();
    const marker: Marker = {
      id: uuidv4(),
      time,
      label,
    };
    set({ markers: [...state.markers, marker] });
  },

  removeMarker: (markerId) => {
    const state = get();
    set({ markers: state.markers.filter((m) => m.id !== markerId) });
  },
}));
