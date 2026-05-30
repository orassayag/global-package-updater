import { execSync } from 'child_process';

export function updatePnpm(): void {
  execSync('pnpm self-update', { stdio: 'ignore' });
}

export function isPnpmInstalled(): boolean {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
