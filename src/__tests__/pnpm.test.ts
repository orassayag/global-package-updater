import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePnpm, isPnpmInstalled } from '../utils/pnpm.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('pnpm utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updatePnpm', () => {
    it('should call pnpm self-update', () => {
      updatePnpm();
      expect(execSync).toHaveBeenCalledWith('pnpm self-update', {
        stdio: 'ignore',
      });
    });
  });

  describe('isPnpmInstalled', () => {
    it('should return true if pnpm --version succeeds', () => {
      (execSync as any).mockReturnValue('11.1.3\n');
      expect(isPnpmInstalled()).toBe(true);
      expect(execSync).toHaveBeenCalledWith('pnpm --version', {
        stdio: 'ignore',
      });
    });

    it('should return false if pnpm --version fails', () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('command not found');
      });
      expect(isPnpmInstalled()).toBe(false);
    });
  });
});
