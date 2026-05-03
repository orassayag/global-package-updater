import { execSync } from 'child_process';
import semver from 'semver';

export interface VersionInfo {
  name: string;
  current: string;
  latest: string;
  needsUpdate: boolean;
}

export async function checkNodeVersion(): Promise<VersionInfo> {
  const current = process.version.replace('v', '');
  let latest = current;

  try {
    const response = await fetch('https://nodejs.org/dist/index.json');
    const data = (await response.json()) as { version: string }[];
    if (data && data.length > 0) {
      // The first one is the latest
      latest = data[0].version.replace('v', '');
    }
  } catch (error) {
    // Fallback if fetch fails
  }

  return {
    name: 'Node.js',
    current,
    latest,
    needsUpdate: semver.gt(latest, current),
  };
}

export async function checkGitVersion(): Promise<VersionInfo> {
  let current = '0.0.0';
  try {
    const output = execSync('git --version', { encoding: 'utf-8' });
    const match = output.match(/git version (\d+\.\d+\.\d+)/);
    if (match) current = match[1];
  } catch {
    // Git not installed
  }

  let latest = current;
  try {
    // Try to get latest git version from GitHub API (tags of git/git)
    const response = await fetch('https://api.github.com/repos/git/git/tags', {
      headers: { 'User-Agent': 'global-package-updater' },
    });
    const data = (await response.json()) as { name: string }[];
    if (Array.isArray(data)) {
      const versions = data
        .map((tag) => tag.name.replace('v', ''))
        .filter((v) => semver.valid(v))
        .sort(semver.rcompare);
      if (versions.length > 0) {
        latest = versions[0];
      }
    }
  } catch (error) {
    // Fallback
  }

  return {
    name: 'Git',
    current,
    latest,
    needsUpdate: semver.gt(latest, current),
  };
}
