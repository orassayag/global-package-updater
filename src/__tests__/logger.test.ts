import { describe, it, expect, vi } from 'vitest';
import { Logger } from '../utils/logger.js';
import chalk from 'chalk';

describe('Logger', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  it('should log info message', () => {
    Logger.info('test info');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test info'));
  });

  it('should log success message', () => {
    Logger.success('test success');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('test success'),
    );
  });

  it('should log warn message', () => {
    Logger.warn('test warn');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test warn'));
  });

  it('should log error message', () => {
    Logger.error('test error');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test error'));
  });

  it('should log section with title', () => {
    Logger.section('TEST SECTION');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('TEST SECTION'),
    );
  });
});
