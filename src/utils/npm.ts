import { execSync } from 'child_process';
import { Logger } from './logger.js';

export interface OutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  location: string;
}

export function getOutdatedPackages(): OutdatedPackage[] {
  try {
    // npm outdated returns exit code 1 if there are outdated packages
    const output = execSync('npm outdated -g --json', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (!output || output.trim() === '') return [];
    
    const json = JSON.parse(output);
    return Object.entries(json).map(([name, info]: [string, any]) => ({
      name,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest,
      location: info.location
    }));
  } catch (error: any) {
    // If exit code is 1, it means there are outdated packages, and the output is in stdout
    if (error.stdout) {
      try {
        const json = JSON.parse(error.stdout.toString());
        return Object.entries(json).map(([name, info]: [string, any]) => ({
          name,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          location: info.location
        }));
      } catch (parseError) {
        return [];
      }
    }
    return [];
  }
}

export function updatePackage(packageName: string): void {
  execSync(`npm install -g ${packageName}`, { stdio: 'ignore' });
}
