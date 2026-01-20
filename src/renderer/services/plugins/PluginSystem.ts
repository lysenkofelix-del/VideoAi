/**
 * Plugin System - Extensible plugin architecture for custom effects and tools
 */

import { Clip, Effect } from '@shared/types';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: 'effect' | 'transition' | 'generator' | 'tool' | 'export';
  icon?: string;
  enabled: boolean;
  main: PluginMain;
  settings?: PluginSettings;
}

export interface PluginMain {
  activate: () => void;
  deactivate: () => void;
  execute?: (context: PluginContext) => Promise<any>;
}

export interface PluginContext {
  clips: Clip[];
  selectedClip?: Clip;
  timeline: any;
  project: any;
  utils: PluginUtils;
}

export interface PluginUtils {
  showNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  showDialog: (options: any) => Promise<any>;
  getClipMetadata: (clipId: string) => Promise<any>;
  applyEffect: (clip: Clip, effect: Effect) => void;
}

export interface PluginSettings {
  [key: string]: any;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: Plugin['type'];
  main: string; // Path to main JS file
  icon?: string;
  permissions: string[];
  dependencies?: { [key: string]: string };
}

export class PluginSystem {
  private static instance: PluginSystem;
  private plugins: Map<string, Plugin> = new Map();
  private scriptElements: Map<string, HTMLScriptElement> = new Map();

  private constructor() {}

  static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }

  /**
   * Register plugin
   */
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} already registered`);
      return;
    }

    this.plugins.set(plugin.id, plugin);
    console.log(`✅ Plugin registered: ${plugin.name} v${plugin.version}`);

    // Activate if enabled
    if (plugin.enabled) {
      this.activatePlugin(plugin.id);
    }
  }

  /**
   * Unregister plugin
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    if (plugin.enabled) {
      this.deactivatePlugin(pluginId);
    }

    this.plugins.delete(pluginId);
    console.log(`✅ Plugin unregistered: ${plugin.name}`);
  }

  /**
   * Activate plugin
   */
  activatePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return;
    }

    try {
      plugin.main.activate();
      plugin.enabled = true;
      console.log(`✅ Plugin activated: ${plugin.name}`);
    } catch (error) {
      console.error(`Failed to activate plugin ${plugin.name}:`, error);
    }
  }

  /**
   * Deactivate plugin
   */
  deactivatePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    try {
      plugin.main.deactivate();
      plugin.enabled = false;
      console.log(`✅ Plugin deactivated: ${plugin.name}`);
    } catch (error) {
      console.error(`Failed to deactivate plugin ${plugin.name}:`, error);
    }
  }

  /**
   * Execute plugin
   */
  async executePlugin(pluginId: string, context: PluginContext): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!plugin.enabled) {
      throw new Error(`Plugin ${plugin.name} is not enabled`);
    }

    if (!plugin.main.execute) {
      throw new Error(`Plugin ${plugin.name} does not have execute method`);
    }

    console.log(`🔌 Executing plugin: ${plugin.name}`);

    try {
      const result = await plugin.main.execute(context);
      console.log(`✅ Plugin executed: ${plugin.name}`);
      return result;
    } catch (error) {
      console.error(`Plugin execution failed: ${plugin.name}`, error);
      throw error;
    }
  }

  /**
   * Load plugin from URL
   */
  async loadPluginFromURL(url: string): Promise<void> {
    console.log(`📦 Loading plugin from: ${url}`);

    try {
      // Fetch plugin manifest
      const manifestResponse = await fetch(`${url}/plugin.json`);
      const manifest: PluginManifest = await manifestResponse.json();

      // Validate manifest
      if (!manifest.id || !manifest.name || !manifest.version) {
        throw new Error('Invalid plugin manifest');
      }

      // Load main script
      const scriptResponse = await fetch(`${url}/${manifest.main}`);
      const scriptCode = await scriptResponse.text();

      // Create sandbox for plugin execution
      const sandbox = {
        console,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
      };

      // Execute plugin code in sandbox
      const pluginFactory = new Function(
        'sandbox',
        `with (sandbox) { ${scriptCode}; return plugin; }`
      );

      const pluginModule = pluginFactory(sandbox);

      // Create plugin instance
      const plugin: Plugin = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        author: manifest.author,
        description: manifest.description,
        type: manifest.type,
        icon: manifest.icon,
        enabled: false,
        main: pluginModule.main,
        settings: pluginModule.settings,
      };

      // Register plugin
      this.registerPlugin(plugin);

      console.log(`✅ Plugin loaded: ${manifest.name}`);
    } catch (error) {
      console.error('Failed to load plugin:', error);
      throw error;
    }
  }

  /**
   * Install plugin from marketplace
   */
  async installPlugin(pluginId: string): Promise<void> {
    console.log(`📦 Installing plugin: ${pluginId}`);

    // In real implementation:
    // 1. Download from marketplace
    // 2. Verify signature
    // 3. Extract to plugins directory
    // 4. Load plugin

    // Mock for now
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`✅ Plugin installed: ${pluginId}`);
  }

  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    this.unregisterPlugin(pluginId);

    // Remove plugin files
    // In real implementation, delete from plugins directory

    console.log(`✅ Plugin uninstalled: ${plugin.name}`);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by type
   */
  getPluginsByType(type: Plugin['type']): Plugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.type === type);
  }

  /**
   * Get plugin
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Update plugin settings
   */
  updatePluginSettings(pluginId: string, settings: PluginSettings): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.settings = { ...plugin.settings, ...settings };
      console.log(`✅ Plugin settings updated: ${plugin.name}`);
    }
  }

  /**
   * Search marketplace plugins
   */
  async searchMarketplace(query: string): Promise<PluginManifest[]> {
    console.log(`🔍 Searching marketplace: ${query}`);

    // In real implementation, call marketplace API
    // For now, return mock results

    const mockPlugins: PluginManifest[] = [
      {
        id: 'glitch-effect',
        name: 'Glitch Effect Pro',
        version: '1.0.0',
        author: 'EffectsStudio',
        description: 'Advanced glitch effects with customizable parameters',
        type: 'effect',
        main: 'index.js',
        icon: '⚡',
        permissions: ['timeline:read', 'timeline:write'],
      },
      {
        id: 'auto-captions',
        name: 'Auto Captions Generator',
        version: '2.1.0',
        author: 'AI Tools',
        description: 'Automatically generate captions with AI',
        type: 'generator',
        main: 'index.js',
        icon: '📝',
        permissions: ['ai:access', 'timeline:write'],
      },
      {
        id: 'youtube-export',
        name: 'YouTube Optimizer',
        version: '1.5.0',
        author: 'Social Tools',
        description: 'Export videos optimized for YouTube',
        type: 'export',
        main: 'index.js',
        icon: '📤',
        permissions: ['export:custom'],
      },
    ];

    return mockPlugins.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Create plugin utils for context
   */
  private createPluginUtils(): PluginUtils {
    return {
      showNotification: (message, type) => {
        console.log(`[Plugin Notification - ${type}]:`, message);
        // In real implementation, show toast/notification
      },
      showDialog: async (options) => {
        console.log('[Plugin Dialog]:', options);
        // In real implementation, show modal dialog
        return { confirmed: true };
      },
      getClipMetadata: async (clipId) => {
        // Return clip metadata
        return { id: clipId, duration: 5000 };
      },
      applyEffect: (clip, effect) => {
        clip.effects.push(effect);
        console.log(`Effect applied to clip: ${effect.name}`);
      },
    };
  }

  /**
   * Create example plugins (built-in)
   */
  loadBuiltInPlugins(): void {
    // Example: Vignette Effect Plugin
    this.registerPlugin({
      id: 'vignette-effect',
      name: 'Vignette Effect',
      version: '1.0.0',
      author: 'VideoAI Team',
      description: 'Add cinematic vignette effect',
      type: 'effect',
      icon: '🎭',
      enabled: true,
      main: {
        activate: () => console.log('Vignette Effect activated'),
        deactivate: () => console.log('Vignette Effect deactivated'),
        execute: async (context) => {
          if (context.selectedClip) {
            context.utils.applyEffect(context.selectedClip, {
              id: 'vignette',
              type: 'style',
              name: 'Vignette',
              enabled: true,
              parameters: {
                intensity: 0.5,
                size: 0.8,
              },
            });
            context.utils.showNotification('Vignette effect applied', 'success');
          }
        },
      },
    });

    // Example: Auto Color Grade Plugin
    this.registerPlugin({
      id: 'auto-color-grade',
      name: 'Auto Color Grade',
      version: '1.0.0',
      author: 'VideoAI Team',
      description: 'Automatically color grade clips with AI',
      type: 'tool',
      icon: '🎨',
      enabled: true,
      main: {
        activate: () => console.log('Auto Color Grade activated'),
        deactivate: () => console.log('Auto Color Grade deactivated'),
        execute: async (context) => {
          context.utils.showNotification('Analyzing clips...', 'info');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          context.utils.showNotification('Color grading applied to all clips!', 'success');
        },
      },
    });

    console.log('✅ Built-in plugins loaded');
  }
}

// Singleton instance
export const pluginSystem = PluginSystem.getInstance();
