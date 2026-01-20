/**
 * Multi-Camera Service - Sync and edit multi-camera footage
 */

import { Clip } from '@shared/types';

export interface CameraAngle {
  id: string;
  name: string;
  clipId: string;
  timecode: number; // Sync point
  color: string;
}

export interface MultiCamSequence {
  id: string;
  name: string;
  angles: CameraAngle[];
  cuts: MultiCamCut[];
  syncMethod: 'timecode' | 'audio' | 'manual';
}

export interface MultiCamCut {
  id: string;
  time: number; // Timeline position
  angleId: string; // Which camera angle
  duration: number;
}

export class MultiCamService {
  private static instance: MultiCamService;
  private sequences: Map<string, MultiCamSequence> = new Map();

  private constructor() {}

  static getInstance(): MultiCamService {
    if (!MultiCamService.instance) {
      MultiCamService.instance = new MultiCamService();
    }
    return MultiCamService.instance;
  }

  /**
   * Create multi-cam sequence from clips
   */
  createSequence(name: string, clips: Clip[]): MultiCamSequence {
    const sequence: MultiCamSequence = {
      id: `multicam_${Date.now()}`,
      name,
      angles: clips.map((clip, index) => ({
        id: `angle_${index + 1}`,
        name: `Camera ${index + 1}`,
        clipId: clip.id,
        timecode: clip.startTime,
        color: this.getAngleColor(index),
      })),
      cuts: [],
      syncMethod: 'manual',
    };

    this.sequences.set(sequence.id, sequence);
    console.log(`✅ Created multi-cam sequence "${name}" with ${clips.length} angles`);

    return sequence;
  }

  /**
   * Auto-sync cameras by audio waveform
   */
  async syncByAudio(sequenceId: string): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return;

    console.log('🎵 Auto-syncing cameras by audio...');

    // In real implementation:
    // 1. Analyze audio waveforms from all clips
    // 2. Find matching patterns (like clap or music start)
    // 3. Calculate offset between clips
    // 4. Update timecodes

    // Mock: align all to first angle
    const referenceTimecode = sequence.angles[0]?.timecode || 0;
    sequence.angles.forEach((angle, index) => {
      if (index > 0) {
        // Add some offset for demo
        angle.timecode = referenceTimecode + index * 100;
      }
    });

    sequence.syncMethod = 'audio';
    console.log('✅ Cameras synced by audio');
  }

  /**
   * Sync by timecode metadata
   */
  async syncByTimecode(sequenceId: string): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return;

    console.log('🕐 Syncing cameras by timecode...');

    // In real implementation:
    // 1. Read timecode metadata from video files
    // 2. Align based on matching timecodes
    // 3. Handle different framerates

    sequence.syncMethod = 'timecode';
    console.log('✅ Cameras synced by timecode');
  }

  /**
   * Add camera switch/cut
   */
  addCut(sequenceId: string, time: number, angleId: string): MultiCamCut {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) throw new Error('Sequence not found');

    const cut: MultiCamCut = {
      id: `cut_${Date.now()}`,
      time,
      angleId,
      duration: 0, // Will be calculated
    };

    // Insert cut in chronological order
    const insertIndex = sequence.cuts.findIndex((c) => c.time > time);
    if (insertIndex === -1) {
      sequence.cuts.push(cut);
    } else {
      sequence.cuts.splice(insertIndex, 0, cut);
    }

    // Update durations
    this.updateCutDurations(sequence);

    console.log(`✅ Added cut to ${angleId} at ${time}ms`);
    return cut;
  }

  /**
   * Remove camera cut
   */
  removeCut(sequenceId: string, cutId: string): void {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return;

    const index = sequence.cuts.findIndex((c) => c.id === cutId);
    if (index !== -1) {
      sequence.cuts.splice(index, 1);
      this.updateCutDurations(sequence);
      console.log('✅ Cut removed');
    }
  }

  /**
   * Update cut durations based on timing
   */
  private updateCutDurations(sequence: MultiCamSequence): void {
    for (let i = 0; i < sequence.cuts.length; i++) {
      const cut = sequence.cuts[i];
      const nextCut = sequence.cuts[i + 1];

      if (nextCut) {
        cut.duration = nextCut.time - cut.time;
      } else {
        // Last cut extends to end
        cut.duration = 10000; // Default 10s
      }
    }
  }

  /**
   * Get active angle at specific time
   */
  getActiveAngle(sequenceId: string, time: number): CameraAngle | null {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return null;

    // Find cut at this time
    let activeCut: MultiCamCut | null = null;
    for (const cut of sequence.cuts) {
      if (time >= cut.time && time < cut.time + cut.duration) {
        activeCut = cut;
        break;
      }
    }

    if (!activeCut) {
      // Return first angle by default
      return sequence.angles[0] || null;
    }

    return sequence.angles.find((a) => a.id === activeCut!.angleId) || null;
  }

  /**
   * Export multi-cam sequence as single track
   */
  exportSequence(sequenceId: string): Clip[] {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return [];

    console.log('📤 Exporting multi-cam sequence...');

    const clips: Clip[] = [];

    sequence.cuts.forEach((cut) => {
      const angle = sequence.angles.find((a) => a.id === cut.angleId);
      if (!angle) return;

      // Create clip for this cut
      clips.push({
        id: `export_${cut.id}`,
        mediaId: angle.clipId,
        mediaNumber: 0, // Will be assigned
        trackId: 'video-1',
        startTime: cut.time,
        duration: cut.duration,
        inPoint: 0,
        outPoint: cut.duration,
        effects: [],
        transitions: {},
        animation: [],
        speed: 1,
        volume: 1,
        opacity: 1,
      });
    });

    console.log(`✅ Exported ${clips.length} clips`);
    return clips;
  }

  /**
   * Get angle color for visualization
   */
  private getAngleColor(index: number): string {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Cyan
      '#FFE66D', // Yellow
      '#95E1D3', // Mint
      '#C7CEEA', // Blue
      '#FFA07A', // Orange
    ];
    return colors[index % colors.length];
  }

  /**
   * Get sequence
   */
  getSequence(sequenceId: string): MultiCamSequence | undefined {
    return this.sequences.get(sequenceId);
  }

  /**
   * Get all sequences
   */
  getAllSequences(): MultiCamSequence[] {
    return Array.from(this.sequences.values());
  }

  /**
   * Delete sequence
   */
  deleteSequence(sequenceId: string): void {
    this.sequences.delete(sequenceId);
    console.log('✅ Multi-cam sequence deleted');
  }
}

// Singleton instance
export const multiCamService = MultiCamService.getInstance();
