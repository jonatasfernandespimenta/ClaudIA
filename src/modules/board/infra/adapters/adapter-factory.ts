import { BoardAdapter, AdapterConfig } from "./board-adapter";
import { PipefyAdapter } from "./pipefy-adapter";
import { ShortcutAdapter } from "./shortcut-adapter";

export class AdapterFactory {
  /**
   * Create a board adapter based on the provided configuration
   * @param config - The adapter configuration
   * @returns BoardAdapter instance
   */
  static createAdapter(config: AdapterConfig): BoardAdapter {
    switch (config.type) {
      case 'pipefy':
        return new PipefyAdapter(config);
      
      case 'shortcut':
        return new ShortcutAdapter(config);
      
      default:
        throw new Error(`Unsupported adapter type: ${(config as any).type}`);
    }
  }

  /**
   * Create multiple adapters from an array of configurations
   * @param configs - Array of adapter configurations
   * @returns Map of adapter type to adapter instance
   */
  static createAdapters(configs: AdapterConfig[]): Map<string, BoardAdapter> {
    const adapters = new Map<string, BoardAdapter>();

    for (const config of configs) {
      const adapter = this.createAdapter(config);
      adapters.set(config.type, adapter);
    }

    return adapters;
  }

  /**
   * Get supported adapter types
   * @returns Array of supported adapter type strings
   */
  static getSupportedTypes(): string[] {
    return ['pipefy', 'shortcut'];
  }

  /**
   * Validate adapter configuration
   * @param config - The adapter configuration to validate
   * @returns boolean indicating if configuration is valid
   */
  static validateConfig(config: AdapterConfig): boolean {
    // Check if type is supported
    if (!this.getSupportedTypes().includes(config.type)) {
      return false;
    }

    // Check if required fields are present
    if (!config.apiKey || config.apiKey.trim() === '') {
      return false;
    }

    // Type-specific validation
    switch (config.type) {
      case 'pipefy':
        // Pipefy might need organizationId for some operations
        return true;
      
      case 'shortcut':
        // Shortcut works with just API key
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Get configuration template for a specific adapter type
   * @param type - The adapter type
   * @returns Configuration template object
   */
  static getConfigTemplate(type: 'pipefy' | 'shortcut'): Partial<AdapterConfig> {
    switch (type) {
      case 'pipefy':
        return {
          type: 'pipefy',
          apiKey: '',
          organizationId: '', // Optional but recommended
          baseUrl: 'https://api.pipefy.com/graphql'
        };
      
      case 'shortcut':
        return {
          type: 'shortcut',
          apiKey: '',
          baseUrl: 'https://api.app.shortcut.com/api/v3'
        };
      
      default:
        throw new Error(`Unsupported adapter type: ${type}`);
    }
  }
}
