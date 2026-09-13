import { describe, it, expect } from 'vitest';
import { APP_VERSION } from './version';
import pkg from '../package.json';

describe('APP_VERSION', () => {
  it('should match the version specified in package.json', () => {
    expect(APP_VERSION).toBe(pkg.version);
    expect(APP_VERSION).toBe('0.1.0');
  });
});
