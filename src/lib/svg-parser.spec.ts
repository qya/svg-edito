import { describe, it, expect } from 'vitest';
import { parseSvg, rectToPath, circleToPath, pointsToPath } from './svg-parser';

describe('svg-parser', () => {
  it('converts rect to path d', () => {
    const d = rectToPath(10, 20, 100, 50, 0, 0);
    expect(d).toBe('M 10 20 h 100 v 50 h -100 Z');
  });

  it('converts circle to path d', () => {
    const d = circleToPath(50, 50, 25);
    expect(d).toContain('M 25 50');
    expect(d).toContain('a 25 25 0 1 0 50 0');
    expect(d).toContain('Z');
  });

  it('converts polygon points to closed path d', () => {
    const d = pointsToPath('10,10 20,20 30,10', true);
    expect(d).toBe('M 10 10 L 20 20 L 30 10 Z');
  });

  it('parses full SVG with multiple elements', () => {
    const svg = `
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <rect id="bg" x="0" y="0" width="500" height="500" fill="#222" />
        <circle id="sun" cx="250" cy="250" r="100" fill="#ffcc00" stroke="#fff" stroke-width="4" />
        <path id="wave" d="M 0 250 Q 125 200 250 250 T 500 250" stroke="#00bcd4" stroke-width="2" fill="none" />
      </svg>
    `;
    const doc = parseSvg(svg);
    expect(doc.viewBox).toEqual({ x: 0, y: 0, width: 500, height: 500 });
    expect(doc.layers.length).toBe(3);

    const [bg, sun, wave] = doc.layers;
    expect(bg.name).toBe('bg');
    expect(bg.type).toBe('rect');
    expect(bg.fill).toBe('#222');
    expect(bg.d).toBe('M 0 0 h 500 v 500 h -500 Z');

    expect(sun.name).toBe('sun');
    expect(sun.type).toBe('circle');
    expect(sun.fill).toBe('#ffcc00');
    expect(sun.stroke).toBe('#fff');
    expect(sun.strokeWidth).toBe(4);

    expect(wave.name).toBe('wave');
    expect(wave.type).toBe('path');
    expect(wave.d).toBe('M 0 250 Q 125 200 250 250 T 500 250');
    expect(wave.stroke).toBe('#00bcd4');
  });

  it('parses nested groups', () => {
    const svg = `
      <svg viewBox="0 0 100 100">
        <g id="group1">
          <path id="p1" d="M 10 10 L 90 90" stroke="black" />
          <path id="p2" d="M 90 10 L 10 90" stroke="red" />
        </g>
      </svg>
    `;
    const doc = parseSvg(svg);
    expect(doc.layers.length).toBe(1);
    expect(doc.layers[0].type).toBe('group');
    expect(doc.layers[0].children?.length).toBe(2);
    expect(doc.layers[0].children?.[0].name).toBe('p1');
    expect(doc.layers[0].children?.[1].name).toBe('p2');
  });

  it('parses preset colors using style block with .cls-0 and .cls-1 classes', () => {
    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <style type="text/css">
          .cls-0 {fill:#363738;}
          .cls-1 {fill:#448CEF;}
        </style>
        <path class="cls-0" d="M 0 0 L 50 50 Z" />
        <path class="cls-1" d="M 50 50 L 100 100 Z" />
      </svg>
    `;
    const doc = parseSvg(svg);
    expect(doc.layers.length).toBe(2);
    expect(doc.layers[0].fill).toBe('#363738');
    expect(doc.layers[1].fill).toBe('#448CEF');
  });

  it('parses CDATA wrapped styles and unquoted attributes', () => {
    const svg = `
      <svg viewBox="0 0 100 100">
        <style type="text/css">
          <![CDATA[
            .st0 { fill: #E02424; stroke: #111827; }
            path.custom { fill: #10B981 !important; }
          ]]>
        </style>
        <path class="st0" d="M 10 10 L 20 20" />
        <path class="custom" d="M 30 30 L 40 40" fill=#00BCD4 />
      </svg>
    `;
    const doc = parseSvg(svg);
    expect(doc.layers.length).toBe(2);
    expect(doc.layers[0].fill).toBe('#E02424');
    expect(doc.layers[0].stroke).toBe('#111827');
    // Inline / direct attribute takes precedence over class
    expect(doc.layers[1].fill).toBe('#00BCD4');
  });

  it('inherits fill from parent <g> container element', () => {
    const svg = `
      <svg viewBox="0 0 100 100">
        <g fill="#8B5CF6">
          <path id="child1" d="M 0 0 L 10 10" />
          <path id="child2" d="M 20 20 L 30 30" fill="#EC4899" />
        </g>
      </svg>
    `;
    const doc = parseSvg(svg);
    expect(doc.layers.length).toBe(1);
    const group = doc.layers[0];
    expect(group.children?.length).toBe(2);
    expect(group.children?.[0].fill).toBe('#8B5CF6'); // inherited
    expect(group.children?.[1].fill).toBe('#EC4899'); // overridden
  });
});
