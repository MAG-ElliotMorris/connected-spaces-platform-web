import { describe, it, expect, beforeAll } from 'vitest';
import { loadCSP } from './loadModule';
import type { CSPModule } from './csp';

describe('CSPFoundation', () => {
  let csp: CSPModule;

  beforeAll(async () => {
    csp = await loadCSP();
  });

  it('exports GetVersion', () => {
    expect(typeof csp.GetVersion).toBe('function');
  });

  it('returns a non-empty version string', () => {
    const version = csp.GetVersion();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });
});
