import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkNodeVersion, checkGitVersion } from '../utils/versionCheck.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('versionCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkNodeVersion', () => {
    it('should return the latest LTS version info when fetch succeeds', async () => {
      const mockNodeData = [
        { version: 'v26.0.0', lts: false },
        { version: 'v24.16.0', lts: 'Iron' },
        { version: 'v22.10.0', lts: 'Hydrogen' },
      ];
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockNodeData,
      });

      const result = await checkNodeVersion();

      expect(result.name).toBe('Node.js');
      expect(result.latest).toBe('24.16.0');
      expect(typeof result.current).toBe('string');
      expect(typeof result.needsUpdate).toBe('boolean');
    });

    it('should fallback to current version if no LTS version is found', async () => {
      const mockNodeData = [{ version: 'v26.0.0', lts: false }];
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockNodeData,
      });

      const result = await checkNodeVersion();

      expect(result.latest).toBe(result.current);
    });

    it('should fallback to current version when fetch fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkNodeVersion();

      expect(result.name).toBe('Node.js');
      expect(result.latest).toBe(result.current);
      expect(result.needsUpdate).toBe(false);
    });
  });

  describe('checkGitVersion', () => {
    it('should return git version info and filter out pre-releases', async () => {
      (execSync as any).mockReturnValue('git version 2.40.0');
      const mockGitTags = [
        { name: 'v2.42.0-rc1' },
        { name: 'v2.41.0' },
        { name: 'v2.40.0' },
      ];
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockGitTags,
      });

      const result = await checkGitVersion();

      expect(result.name).toBe('Git');
      expect(result.current).toBe('2.40.0');
      expect(result.latest).toBe('2.41.0'); // Should skip 2.42.0-rc1
      expect(result.needsUpdate).toBe(true);
    });

    it('should handle git tags fetch failure', async () => {
      (execSync as any).mockReturnValue('git version 2.40.0');
      (global.fetch as any).mockRejectedValueOnce(new Error('Fetch failed'));

      const result = await checkGitVersion();

      expect(result.current).toBe('2.40.0');
      expect(result.latest).toBe('2.40.0');
      expect(result.needsUpdate).toBe(false);
    });

    it('should handle empty git tags response', async () => {
      (execSync as any).mockReturnValue('git version 2.40.0');
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ message: 'Not Found' }), // Not an array
      });

      const result = await checkGitVersion();

      expect(result.current).toBe('2.40.0');
      expect(result.latest).toBe('2.40.0');
    });

    it('should handle git version output not matching pattern', async () => {
      (execSync as any).mockReturnValue('some invalid git output');
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => [],
      });

      const result = await checkGitVersion();

      expect(result.current).toBe('0.0.0');
    });

    it('should handle git not installed', async () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('command not found');
      });
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => [],
      });

      const result = await checkGitVersion();

      expect(result.current).toBe('0.0.0');
      expect(result.needsUpdate).toBe(false);
    });
  });
});
