import { describe, it, expect } from 'vitest';
import { parseSvg } from './lib/svg-parser';
import { kDefaultSvg, kDefaultLayers, kDefaultPath, kDefaultViewBox, createDefaultLayers } from './App';

describe('default SVG and layers initialization', () => {
  it('parses kDefaultSvg into 3 styled layers with viewBox 0 0 100 100', () => {
    const doc = parseSvg(kDefaultSvg);
    expect(doc.viewBox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(doc.layers.length).toBe(3);

    // Layer 1 and 2 are #1671F8, Layer 3 is #4490FC
    expect(doc.layers[0].fill).toBe('#1671F8');
    expect(doc.layers[1].fill).toBe('#1671F8');
    expect(doc.layers[2].fill).toBe('#4490FC');
  });

  it('provides kDefaultLayers and kDefaultPath', () => {
    expect(kDefaultLayers.length).toBe(3);
    expect(kDefaultPath).toBe(kDefaultLayers[0].d);
    expect(kDefaultViewBox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('createDefaultLayers returns fresh cloned copies', () => {
    const layers1 = createDefaultLayers();
    const layers2 = createDefaultLayers();
    expect(layers1).toEqual(layers2);
    expect(layers1).not.toBe(layers2);
    expect(layers1[0]).not.toBe(layers2[0]);
  });
});
