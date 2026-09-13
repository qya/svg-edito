import { describe, it, expect, beforeEach } from 'vitest';
import { encodeSharePayload, decodeShareHash, SharePayload } from './share-url';
import { Layer } from '../types/layer';

describe('share-url utility', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          origin: 'https://svgedit.app',
          pathname: '/'
        }
      },
      writable: true
    });
  });

  it('encodes and decodes path share payload correctly', () => {
    const payload: SharePayload = {
      type: 'path',
      path: 'M10 10 L20 20 Z',
      name: 'Triangle'
    };

    const url = encodeSharePayload(payload);
    expect(url.startsWith('https://svgedit.app/#d=')).toBe(true);

    const hash = url.split('#')[1];
    const decoded = decodeShareHash(hash);
    expect(decoded).toEqual(payload);
  });

  it('encodes and decodes full document share payload correctly', () => {
    const testLayers: Layer[] = [
      {
        id: 'l1',
        name: 'Layer 1',
        type: 'path',
        d: 'M0 0 L50 50 Z',
        visible: true,
        locked: false,
        fill: '#ff0000'
      },
      {
        id: 'l2',
        name: 'Layer 2',
        type: 'rect',
        d: 'M10 10 h 20 v 20 h -20 Z',
        visible: true,
        locked: false,
        stroke: '#00ff00',
        strokeWidth: 2
      }
    ];

    const payload: SharePayload = {
      type: 'document',
      name: 'Sample Doc',
      viewBox: { x: 0, y: 0, width: 200, height: 200 },
      layers: testLayers,
      activeLayerId: 'l1'
    };

    const url = encodeSharePayload(payload);
    const hash = url.split('#')[1];
    const decoded = decodeShareHash('#' + hash);

    expect(decoded).toEqual(payload);
  });

  it('handles legacy #P=... URLs with backward compatibility', () => {
    const legacyHash = '#P=M10_10L20_20Z';
    const decoded = decodeShareHash(legacyHash);
    expect(decoded).toEqual({
      type: 'legacy_path',
      path: 'M10 10L20 20Z'
    });
  });

  it('returns null for empty or corrupt hashes', () => {
    expect(decodeShareHash('')).toBeNull();
    expect(decodeShareHash('#')).toBeNull();
    expect(decodeShareHash('#d=invalid_garbage_content_$$$')).toBeNull();
    expect(decodeShareHash('#P=invalid path with @@@')).toBeNull();
  });
});
