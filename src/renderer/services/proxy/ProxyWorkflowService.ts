/**
 * Proxy Workflow Service - Handle proxy media for smooth editing
 */

import { MediaItem } from '@shared/types';

export interface ProxySettings {
  enabled: boolean;
  resolution: '1080p' | '720p' | '540p' | '360p';
  codec: 'h264' | 'prores_proxy';
  quality: 'low' | 'medium' | 'high';
  autoGenerate: boolean;
}

export interface ProxyMedia {
  originalId: string;
  proxyPath: string;
  resolution: string;
  fileSize: number;
  status: 'generating' | 'ready' | 'error';
  progress: number;
}

export class ProxyWorkflowService {
  private static instance: ProxyWorkflowService;
  private settings: ProxySettings = {
    enabled: true,
    resolution: '720p',
    codec: 'h264',
    quality: 'medium',
    autoGenerate: true,
  };
  private proxyMedia: Map<string, ProxyMedia> = new Map();

  private constructor() {}

  static getInstance(): ProxyWorkflowService {
    if (!ProxyWorkflowService.instance) {
      ProxyWorkflowService.instance = new ProxyWorkflowService();
    }
    return ProxyWorkflowService.instance;
  }

  /**
   * Generate proxy for media
   */
  async generateProxy(media: MediaItem): Promise<ProxyMedia> {
    console.log(`🔄 Generating proxy for: ${media.name}`);

    const proxy: ProxyMedia = {
      originalId: media.id,
      proxyPath: `proxies/${media.id}_proxy.mp4`,
      resolution: this.settings.resolution,
      fileSize: 0,
      status: 'generating',
      progress: 0,
    };

    this.proxyMedia.set(media.id, proxy);

    // Simulate proxy generation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      proxy.progress = i;
    }

    proxy.status = 'ready';
    proxy.fileSize = 10 * 1024 * 1024; // Mock 10MB

    console.log(`✅ Proxy generated: ${proxy.proxyPath}`);
    return proxy;
  }

  /**
   * Generate proxies for all media
   */
  async generateAllProxies(mediaItems: MediaItem[]): Promise<void> {
    console.log(`🔄 Generating proxies for ${mediaItems.length} items...`);

    const videoItems = mediaItems.filter((m) => m.type === 'video');

    for (const media of videoItems) {
      if (!this.proxyMedia.has(media.id)) {
        await this.generateProxy(media);
      }
    }

    console.log(`✅ All proxies generated`);
  }

  /**
   * Delete proxy
   */
  deleteProxy(mediaId: string): void {
    const proxy = this.proxyMedia.get(mediaId);
    if (proxy) {
      // Delete proxy file
      this.proxyMedia.delete(mediaId);
      console.log(`✅ Proxy deleted: ${mediaId}`);
    }
  }

  /**
   * Delete all proxies
   */
  deleteAllProxies(): void {
    this.proxyMedia.clear();
    console.log('✅ All proxies deleted');
  }

  /**
   * Get proxy for media
   */
  getProxy(mediaId: string): ProxyMedia | undefined {
    return this.proxyMedia.get(mediaId);
  }

  /**
   * Check if media has proxy
   */
  hasProxy(mediaId: string): boolean {
    const proxy = this.proxyMedia.get(mediaId);
    return proxy?.status === 'ready';
  }

  /**
   * Get proxy path
   */
  getProxyPath(mediaId: string): string | null {
    const proxy = this.proxyMedia.get(mediaId);
    return proxy?.status === 'ready' ? proxy.proxyPath : null;
  }

  /**
   * Toggle proxy mode
   */
  toggleProxyMode(): boolean {
    this.settings.enabled = !this.settings.enabled;
    console.log(`Proxy mode: ${this.settings.enabled ? 'enabled' : 'disabled'}`);
    return this.settings.enabled;
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<ProxySettings>): void {
    this.settings = { ...this.settings, ...settings };
    console.log('✅ Proxy settings updated');
  }

  /**
   * Get settings
   */
  getSettings(): ProxySettings {
    return { ...this.settings };
  }

  /**
   * Get all proxies
   */
  getAllProxies(): ProxyMedia[] {
    return Array.from(this.proxyMedia.values());
  }

  /**
   * Get proxy statistics
   */
  getStatistics(): {
    total: number;
    ready: number;
    generating: number;
    totalSize: number;
    spaceSaved: number;
  } {
    const proxies = this.getAllProxies();

    return {
      total: proxies.length,
      ready: proxies.filter((p) => p.status === 'ready').length,
      generating: proxies.filter((p) => p.status === 'generating').length,
      totalSize: proxies.reduce((sum, p) => sum + p.fileSize, 0),
      spaceSaved: proxies.length * 50 * 1024 * 1024, // Mock: ~50MB saved per proxy
    };
  }

  /**
   * Reconnect original media (for final export)
   */
  async reconnectOriginals(mediaIds: string[]): Promise<void> {
    console.log('🔗 Reconnecting original media for export...');

    // In real implementation:
    // 1. Find all clips using proxies
    // 2. Replace proxy paths with original paths
    // 3. Verify original files exist
    // 4. Update timeline references

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('✅ Original media reconnected');
  }
}

// Singleton instance
export const proxyWorkflowService = ProxyWorkflowService.getInstance();
