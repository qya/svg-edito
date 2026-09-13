import { getConfigKey } from '../constants/storage.const';

export interface EditorConfig {
  viewPortX: number;
  viewPortY: number;
  viewPortWidth: number;
  viewPortHeight: number;
  viewPortLocked: boolean;
  filled: boolean;
  renderColors: boolean;
  preview: boolean;
  showTicks: boolean;
  minifyOutput: boolean;
  snapToGrid: boolean;
  decimalPrecision: number;
  showLayersPanel: boolean;
}

export interface ExportConfig {
  fill: boolean;
  fillColor: string;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
}

const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  viewPortX: 0,
  viewPortY: 0,
  viewPortWidth: 30,
  viewPortHeight: 30,
  viewPortLocked: false,
  filled: true,
  renderColors: true,
  preview: false,
  showTicks: false,
  minifyOutput: false,
  snapToGrid: true,
  decimalPrecision: 3,
  showLayersPanel: true
};

const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  fill: true,
  fillColor: '#000000',
  stroke: false,
  strokeColor: '#FF0000',
  strokeWidth: 0.1
};

export function loadEditorConfig(): EditorConfig {
  const result = { ...DEFAULT_EDITOR_CONFIG };
  for (const key of Object.keys(DEFAULT_EDITOR_CONFIG) as (keyof EditorConfig)[]) {
    const storageKey = getConfigKey('ConfigService', key);
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      try {
        (result as Record<string, unknown>)[key] = JSON.parse(stored);
      } catch {
        // use default
      }
    }
  }
  return result;
}

export function saveEditorConfigProp<K extends keyof EditorConfig>(key: K, value: EditorConfig[K]): void {
  const storageKey = getConfigKey('ConfigService', key);
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadExportConfig(): ExportConfig {
  const result = { ...DEFAULT_EXPORT_CONFIG };
  for (const key of Object.keys(DEFAULT_EXPORT_CONFIG) as (keyof ExportConfig)[]) {
    const storageKey = getConfigKey('ExportConfigService', key);
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      try {
        (result as Record<string, unknown>)[key] = JSON.parse(stored);
      } catch {
        // use default
      }
    }
  }
  return result;
}

export function saveExportConfigProp<K extends keyof ExportConfig>(key: K, value: ExportConfig[K]): void {
  const storageKey = getConfigKey('ExportConfigService', key);
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // ignore
  }
}
