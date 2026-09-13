import { describe, it, expect } from 'vitest';
import { SAMPLE_SVGS } from '../../constants/samples.const';
import { SvgPath } from '../../lib/svg';
import { STORAGE } from '../../constants/storage.const';

describe('StartupDialog and Sample SVGs', () => {
  it('defines STORAGE.STARTUP_SHOWN key', () => {
    expect(STORAGE.STARTUP_SHOWN).toBe('svg_editor_startup_shown');
  });

  it('contains valid sample SVGs with parsable path commands', () => {
    expect(SAMPLE_SVGS.length).toBeGreaterThanOrEqual(4);

    for (const sample of SAMPLE_SVGS) {
      expect(sample.title).toBeTruthy();
      expect(sample.d).toBeTruthy();
      expect(sample.viewBox).toBeDefined();
      expect(sample.viewBox.width).toBeGreaterThan(0);
      expect(sample.viewBox.height).toBeGreaterThan(0);

      // Verify path syntax is valid and parses without throwing
      const pathObj = new SvgPath(sample.d);
      expect(pathObj.path.length).toBeGreaterThan(0);
    }
  });

  it('includes logo, heart, star, and rocket samples', () => {
    const ids = SAMPLE_SVGS.map(s => s.id);
    expect(ids).toContain('feather-logo');
    expect(ids).toContain('heart-icon');
    expect(ids).toContain('star-5point');
    expect(ids).toContain('rocket-ship');
  });
});

  it('feather-logo has multi-path layers defined', () => {
    const logo = SAMPLE_SVGS.find(s => s.id === 'feather-logo');
    expect(logo).toBeDefined();
    expect(logo?.layers).toBeDefined();
    expect(logo?.layers?.length).toBe(3);
    expect(logo?.layers?.[0].d).toBeTruthy();
    expect(logo?.layers?.[1].d).toBeTruthy();
    expect(logo?.layers?.[2].d).toBeTruthy();
  });
