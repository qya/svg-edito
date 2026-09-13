import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Layer } from '../types/layer';

export interface PathSharePayload {
  type: 'path';
  path: string;
  name?: string;
}

export interface DocumentSharePayload {
  type: 'document';
  layers: Layer[];
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  activeLayerId?: string | null;
  name?: string;
}

export type SharePayload = PathSharePayload | DocumentSharePayload;

export type DecodedShareResult =
  | SharePayload
  | { type: 'legacy_path'; path: string };

/**
 * Encodes a share payload into a compressed URL hash.
 */
export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const compressed = compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}#d=${compressed}`;
}

/**
 * Decodes a share payload from a URL hash string.
 * Supports:
 * - #d=<compressed_payload> (lz-string encoded JSON)
 * - #<compressed_payload> (fallback raw lz-string JSON)
 * - #P=<path_string> (legacy format)
 */
export function decodeShareHash(hash: string): DecodedShareResult | null {
  if (!hash || hash.length <= 1) return null;

  // Remove leading '#'
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash;

  // 1. Check for legacy #P=...
  if (rawHash.startsWith('P=')) {
    const fragment = decodeURIComponent(rawHash);
    const check = /^P=[mMlLvVhHcCsSqQtTaAzZ0-9\-e._, ]+$/;
    if (check.test(fragment)) {
      const pathFromUrl = fragment.slice(2).replace(/_/g, ' ');
      return { type: 'legacy_path', path: pathFromUrl };
    }
    return null;
  }

  // 2. Check for #d=...
  let compressedData = '';
  if (rawHash.startsWith('d=')) {
    compressedData = rawHash.slice(2);
  } else {
    compressedData = rawHash;
  }

  if (!compressedData) return null;

  try {
    const decompressed = decompressFromEncodedURIComponent(compressedData);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed);

    if (parsed && typeof parsed === 'object') {
      if (parsed.type === 'path' && typeof parsed.path === 'string') {
        return parsed as PathSharePayload;
      }
      if (parsed.type === 'document' && Array.isArray(parsed.layers)) {
        return parsed as DocumentSharePayload;
      }
      // If array of layers directly (wiretext format compatibility)
      if (Array.isArray(parsed)) {
        return {
          type: 'document',
          layers: parsed as Layer[],
          viewBox: { x: 0, y: 0, width: 100, height: 100 }
        };
      }
    }
  } catch {
    // Decoding failed
    return null;
  }

  return null;
}
