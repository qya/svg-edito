/**
 * LocalStorage key constants
 *
 * Centralized storage key definitions to prevent typos.
 */

export const STORAGE = {
  STORED_PATHS: 'storedPaths',
  CONFIG_PREFIX: 'SaveDecorator',
  STARTUP_SHOWN: 'svg_editor_startup_shown'
} as const;

/**
 * Generate a localStorage key for config properties
 */
export function getConfigKey(className: string, propertyKey: string): string {
  return `${STORAGE.CONFIG_PREFIX}.${className}.${propertyKey}`;
}

