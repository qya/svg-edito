import { describe, it, expect } from 'vitest';
import { exportSvg } from './svg-exporter';
import { SvgDocument } from '../types/layer';

describe('svg-exporter', () => {
  it('exports layers to valid SVG document string', () => {
    const doc: SvgDocument = {
      viewBox: { x: 0, y: 0, width: 200, height: 200 },
      layers: [
        {
          id: 'l1',
          name: 'Box',
          type: 'rect',
          d: 'M 0 0 h 50 v 50 h -50 Z',
          fill: '#ff0000',
          visible: true,
          locked: false
        },
        {
          id: 'l2',
          name: 'Hidden Path',
          type: 'path',
          d: 'M 10 10 L 20 20',
          visible: false,
          locked: false
        }
      ]
    };

    const svg = exportSvg(doc);
    expect(svg).toContain('viewBox="0 0 200 200"');
    expect(svg).toContain('id="l1"');
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).not.toContain('id="l2"');
  });

  it('exports only active layer when requested', () => {
    const doc: SvgDocument = {
      viewBox: { x: 0, y: 0, width: 100, height: 100 },
      layers: [
        {
          id: 'l1',
          name: 'Layer 1',
          type: 'path',
          d: 'M 0 0 L 10 10',
          visible: true,
          locked: false
        },
        {
          id: 'l2',
          name: 'Layer 2',
          type: 'path',
          d: 'M 20 20 L 30 30',
          visible: true,
          locked: false
        }
      ]
    };

    const svg = exportSvg(doc, { exportActiveOnly: true, activeLayerId: 'l2' });
    expect(svg).not.toContain('id="l1"');
    expect(svg).toContain('id="l2"');
  });

  it('emits fill="none" for stroke-only layers to prevent browser default black fill', () => {
    const doc: SvgDocument = {
      viewBox: { x: 0, y: 0, width: 100, height: 100 },
      layers: [
        {
          id: 'outline',
          name: 'Outline',
          type: 'path',
          d: 'M 0 0 L 50 50',
          stroke: '#00bcd4',
          strokeWidth: 2,
          visible: true,
          locked: false
        }
      ]
    };

    const svg = exportSvg(doc);
    expect(svg).toContain('fill="none"');
    expect(svg).toContain('stroke="#00bcd4"');
    expect(svg).toContain('stroke-width="2"');
  });

  it('exports multiple styled layers with different colors', () => {
    const doc: SvgDocument = {
      viewBox: { x: 0, y: 0, width: 100, height: 100 },
      layers: [
        {
          id: 'p1',
          name: 'Path 1',
          type: 'path',
          d: 'M 10 10 L 20 20',
          fill: '#1671F8',
          visible: true,
          locked: false
        },
        {
          id: 'p2',
          name: 'Path 2',
          type: 'path',
          d: 'M 30 30 L 40 40',
          fill: '#4490FC',
          visible: true,
          locked: false
        }
      ]
    };

    const svg = exportSvg(doc);
    expect(svg).toContain('fill="#1671F8"');
    expect(svg).toContain('fill="#4490FC"');
    expect(svg).toContain('id="p1"');
    expect(svg).toContain('id="p2"');
  });

  it('exports parsed default SVG document preserving all layers, colors, and viewBox', () => {
    const doc = {
      viewBox: { x: 0, y: 0, width: 100, height: 100 },
      layers: [
        {
          id: 'cls0_1',
          name: 'Layer 1',
          type: 'path' as const,
          d: 'm78.5 8c-4.9-3.6-10.4-6.4-18.5-6.4',
          fill: '#1671F8',
          visible: true,
          locked: false
        },
        {
          id: 'cls0_2',
          name: 'Layer 2',
          type: 'path' as const,
          d: 'm86.2 44.9c-1.6-2.5-4.6-5.9-7.8-8',
          fill: '#1671F8',
          visible: true,
          locked: false
        },
        {
          id: 'cls1_1',
          name: 'Layer 3',
          type: 'path' as const,
          d: 'm78.5 8.1-13.1 11.6 5.1 3.4',
          fill: '#4490FC',
          visible: true,
          locked: false
        }
      ]
    };

    const svg = exportSvg(doc);
    expect(svg).toContain('viewBox="0 0 100 100"');
    expect(svg).toContain('fill="#1671F8"');
    expect(svg).toContain('fill="#4490FC"');
    const pathMatches = svg.match(/<path /g);
    expect(pathMatches?.length).toBe(3);
  });
});
