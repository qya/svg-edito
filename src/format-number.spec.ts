import { describe, it, expect } from 'vitest';
import { formatNumber } from './lib/svg';

describe('formatNumber and helper logic', () => {
  it('formats numbers according to precision', () => {
    expect(formatNumber(12.34567, 4)).toBe('12.3457');
    expect(formatNumber(10.0, 4)).toBe('10');
    expect(formatNumber(0.00001, 4)).toBe('0');
  });

  it('handles negative and zero values', () => {
    expect(formatNumber(0, 4)).toBe('0');
    expect(formatNumber(-5.5, 4)).toBe('-5.5');
  });
});
