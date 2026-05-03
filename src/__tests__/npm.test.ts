import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOutdatedPackages, updatePackage } from '../utils/npm.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('npm utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOutdatedPackages', () => {
    it('should return parsed outdated packages when npm returns 0', () => {
      const mockJson = JSON.stringify({
        'some-pkg': {
          current: '1.0.0',
          wanted: '1.1.0',
          latest: '1.1.0',
          location: 'global',
        },
      });
      (execSync as any).mockReturnValue(mockJson);

      const result = getOutdatedPackages();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('some-pkg');
      expect(result[0].current).toBe('1.0.0');
    });

    it('should return parsed outdated packages when npm returns 1 (error with stdout)', () => {
      const mockJson = JSON.stringify({
        'other-pkg': {
          current: '2.0.0',
          wanted: '2.1.0',
          latest: '2.1.0',
          location: 'global',
        },
      });
      (execSync as any).mockImplementationOnce(() => {
        const error = new Error('Outdated packages found');
        (error as any).stdout = Buffer.from(mockJson);
        throw error;
      });

      const result = getOutdatedPackages();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('other-pkg');
    });

    it('should return empty array when no output', () => {
      (execSync as any).mockReturnValue('');
      const result = getOutdatedPackages();
      expect(result).toEqual([]);
    });

    it('should return empty array when JSON parse fails in error stdout', () => {
      (execSync as any).mockImplementationOnce(() => {
        const error = new Error('Outdated packages found');
        (error as any).stdout = Buffer.from('invalid json');
        throw error;
      });

      const result = getOutdatedPackages();

      expect(result).toEqual([]);
    });

    it('should return empty array when error has no stdout', () => {
      (execSync as any).mockImplementationOnce(() => {
        throw new Error('Some other error');
      });

      const result = getOutdatedPackages();

      expect(result).toEqual([]);
    });
  });

  describe('updatePackage', () => {
    it('should call execSync with correct command', () => {
      updatePackage('test-pkg');
      expect(execSync).toHaveBeenCalledWith(
        'npm install -g test-pkg',
        expect.any(Object),
      );
    });
  });
});
