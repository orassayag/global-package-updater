import ora from 'ora';
import chalk from 'chalk';
import { Logger } from './utils/logger.js';
import {
  getOutdatedPackages,
  updatePackage,
  OutdatedPackage,
} from './utils/npm.js';
import {
  checkNodeVersion,
  checkGitVersion,
  checkPnpmVersion,
  VersionInfo,
} from './utils/versionCheck.js';
import { updatePnpm, isPnpmInstalled } from './utils/pnpm.js';

async function main() {
  Logger.section('Global Package Updater');
  console.log(chalk.gray('Checking environment and packages...'));

  // 1. Check all versions first
  const [nodeInfo, gitInfo, pnpmInfoInitial] = await Promise.all([
    checkNodeVersion(),
    checkGitVersion(),
    isPnpmInstalled() ? checkPnpmVersion() : Promise.resolve(null),
  ]);

  let pnpmInfo = pnpmInfoInitial;

  // 2. Update Global npm Packages
  const spinner = ora('Checking for outdated global packages...').start();
  const outdated = getOutdatedPackages();
  spinner.stop();

  if (outdated.length === 0) {
    Logger.success('All global packages are up to date!');
  } else {
    Logger.info(`Found ${outdated.length} outdated packages. Updating...`);

    const failed: { name: string; error: string }[] = [];
    const updated: OutdatedPackage[] = [];

    for (let i = 0; i < outdated.length; i++) {
      const pkg = outdated[i];
      const progress = `[${i + 1}/${outdated.length}]`;
      const updateSpinner = ora(
        `Updating ${chalk.cyan(pkg.name)} | ${pkg.current} -> ${pkg.latest} ${progress}`,
      ).start();

      try {
        updatePackage(pkg.name);
        updateSpinner.succeed(
          `Updated ${chalk.cyan(pkg.name)} | ${pkg.current} -> ${pkg.latest} ${progress}`,
        );
        updated.push(pkg);
      } catch (error: any) {
        updateSpinner.fail(
          `Failed to update ${chalk.cyan(pkg.name)} ${progress}`,
        );
        failed.push({ name: pkg.name, error: error.message });
      }
    }

    if (failed.length > 0) {
      Logger.section('Errors');
      failed.forEach((f) => {
        Logger.error(`${chalk.bold(f.name)}: ${f.error}`);
      });
    }

    if (updated.length > 0) {
      Logger.section('Updated Packages');
      updated.forEach((pkg) => {
        console.log(
          `${chalk.cyan(pkg.name.padEnd(20))} | ${pkg.current.padEnd(10)} -> ${pkg.latest}`,
        );
      });
    }
  }

  // 3. Update pnpm if needed
  if (pnpmInfo && pnpmInfo.needsUpdate) {
    Logger.section('pnpm Update');
    const updateSpinner = ora(
      `Updating ${chalk.cyan('pnpm')} | ${pnpmInfo.current} -> ${pnpmInfo.latest}`,
    ).start();
    try {
      updatePnpm();
      updateSpinner.succeed(
        `Updated ${chalk.cyan('pnpm')} | ${pnpmInfo.current} -> ${pnpmInfo.latest}`,
      );
      // Update the info object so the summary shows it's up to date
      pnpmInfo = {
        ...pnpmInfo,
        current: pnpmInfo.latest,
        needsUpdate: false,
      };
    } catch (error: any) {
      updateSpinner.fail(`Failed to update ${chalk.cyan('pnpm')}`);
      Logger.error(error.message);
    }
  }

  // 4. Environment Check Summary
  Logger.section('Environment Check');

  const displayVersion = (info: VersionInfo) => {
    const status = info.needsUpdate
      ? chalk.yellow(`! Needs to be updated manually (Latest: ${info.latest})`)
      : chalk.green('Up to date');
    console.log(
      `${chalk.cyan(info.name.padEnd(20))} | ${info.current.padEnd(10)} | ${status}`,
    );
  };

  displayVersion(nodeInfo);
  displayVersion(gitInfo);
  if (pnpmInfo) {
    displayVersion(pnpmInfo);
  }

  Logger.section('Finish');
  Logger.success('Done!');
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    Logger.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

export { main };
