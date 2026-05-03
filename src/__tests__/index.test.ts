import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../utils/logger.js';
import * as npmUtils from '../utils/npm.js';
import * as versionUtils from '../utils/versionCheck.js';
import { main } from '../index.js';

// Mock the entire modules
vi.mock('../utils/logger.js', () => ({
  Logger: {
    section: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../utils/npm.js', () => ({
  getOutdatedPackages: vi.fn(),
  updatePackage: vi.fn(),
}));

vi.mock('../utils/versionCheck.js', () => ({
  checkNodeVersion: vi.fn(),
  checkGitVersion: vi.fn(),
}));

// Mock ora and chalk
vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  }),
}));

describe('CLI Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run the full update flow when packages are outdated', async () => {
    const mockOutdated = [
      {
        name: 'pkg1',
        current: '1.0.0',
        latest: '1.1.0',
        wanted: '1.1.0',
        location: 'global',
      },
    ];
    vi.mocked(npmUtils.getOutdatedPackages).mockReturnValue(mockOutdated);
    vi.mocked(versionUtils.checkNodeVersion).mockResolvedValue({
      name: 'Node.js',
      current: '20.0.0',
      latest: '20.0.0',
      needsUpdate: false,
    });
    vi.mocked(versionUtils.checkGitVersion).mockResolvedValue({
      name: 'Git',
      current: '2.40.0',
      latest: '2.40.0',
      needsUpdate: false,
    });

    await main();

    expect(Logger.section).toHaveBeenCalledWith('Global Package Updater');
    expect(npmUtils.getOutdatedPackages).toHaveBeenCalled();
    expect(npmUtils.updatePackage).toHaveBeenCalledWith('pkg1');
    expect(Logger.success).toHaveBeenCalledWith('Done!');
  });

  it('should handle update failures', async () => {
    const mockOutdated = [
      {
        name: 'pkg-fail',
        current: '1.0.0',
        latest: '1.1.0',
        wanted: '1.1.0',
        location: 'global',
      },
    ];
    vi.mocked(npmUtils.getOutdatedPackages).mockReturnValue(mockOutdated);
    vi.mocked(npmUtils.updatePackage).mockImplementation(() => {
      throw new Error('Update failed');
    });
    vi.mocked(versionUtils.checkNodeVersion).mockResolvedValue({
      name: 'Node.js',
      current: '20.0.0',
      latest: '20.0.0',
      needsUpdate: false,
    });
    vi.mocked(versionUtils.checkGitVersion).mockResolvedValue({
      name: 'Git',
      current: '2.40.0',
      latest: '2.40.0',
      needsUpdate: false,
    });

    await main();

    expect(Logger.section).toHaveBeenCalledWith('Errors');
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('pkg-fail: Update failed'),
    );
  });

  it('should skip updates if no packages are outdated', async () => {
    vi.mocked(npmUtils.getOutdatedPackages).mockReturnValue([]);
    vi.mocked(versionUtils.checkNodeVersion).mockResolvedValue({
      name: 'Node.js',
      current: '20.0.0',
      latest: '20.0.0',
      needsUpdate: false,
    });
    vi.mocked(versionUtils.checkGitVersion).mockResolvedValue({
      name: 'Git',
      current: '2.40.0',
      latest: '2.40.0',
      needsUpdate: false,
    });

    await main();

    expect(Logger.success).toHaveBeenCalledWith(
      'All global packages are up to date!',
    );
    expect(npmUtils.updatePackage).not.toHaveBeenCalled();
  });
});
