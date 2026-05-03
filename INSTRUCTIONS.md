# Instructions

## Setup Instructions

1. Open the project in your IDE (VSCode recommended)
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Compile the project:
   ```bash
   pnpm run build
   ```

## Prerequisites

- Node.js (v20 or higher)
- pnpm (recommended) or npm
- Internet connection (for version checks and package updates)

## Configuration

### Main Settings

The application is configured to run automatically, but you can adjust behavior via scripts and environment variables:

#### Dry Mode vs Live Mode

- `DRY_MODE`: By default, the application runs in a safe mode if not specified.
- To perform real updates, use: `pnpm run start:live`
- This ensures you can verify what will be updated before committing to changes.

#### Caching

- The application may cache certain check results to improve performance.
- To bypass the cache and force a fresh check, use: `pnpm run start:no-cache`

#### Automatic Synchronization

- For a fully automated experience that syncs everything at once, use: `pnpm run sync`

#### Development Tools

- `pnpm run dev`: Starts the application in watch mode, automatically restarting when source files change.

### Search Engines Configuration

*(Note: This section is repurposed for Package Search behavior)*

The application uses standard NPM registry queries:

- It executes `npm outdated -g --json` to discover outdated global packages.
- It parses the JSON output to extract current, wanted, and latest versions.
- It utilizes the standard global `node_modules` path as the primary scan location.

### Search Keys Configuration

*(Note: This section is repurposed for Version Check behavior)*

The environment check utilizes the following external endpoints:

- **Node.js**: Queries `https://nodejs.org/dist/index.json` to find the latest stable release.
- **Git**: Queries the GitHub API tags for `git/git` to determine the latest official version.

### Filter Configurations

#### Email Address Filters

*(Note: This section is repurposed for Package Filtering)*

- The application scans all globally installed packages.
- You can manually exclude specific packages by modifying the filter logic in `src/utils/npm.ts`.

#### Link Filters

*(Note: This section is repurposed for Version Parsing)*

- Version strings are filtered and normalized using the `semver` library.
- It automatically handles 'v' prefixes and ensures only valid semantic versions are compared.

#### File Extension Filters

*(Note: This section is repurposed for CLI Output)*

- The CLI filters out unnecessary terminal noise to provide a clean, focused update experience.
- Uses `ora` to manage visual spinners and `chalk` for color-coded status reporting.

### Email Domain Configurations

*(Note: This section is repurposed for Update Logic)*

- Sequential Updates: Packages are updated one by one to prevent race conditions.
- Error Recovery: If an update fails, the application captures the error and proceeds to the next package in the queue.

## Running Scripts

### Main Crawler (with Monitor)

*(Note: This section is repurposed for the Main Updater)*

Starts the global package update process:

```bash
pnpm start
```

This launches the orchestration logic which:

- Shows a section header with the tool name
- Scans for all outdated global packages
- Displays real-time progress for each update
- Performs a final environment check for Node.js and Git
- Summarizes all changes and errors

### Backup

*(Note: This section is kept for structure, repurposed for Code Quality)*

Runs formatting and linting to ensure code consistency:

```bash
pnpm run format
pnpm run lint
```

### Domain Counter

*(Note: This section is repurposed for Synchronization)*

Runs the automated sync command:

```bash
pnpm run sync
```

### Tests

#### Validate Single Email

*(Note: This section is repurposed for Vitest UI)*

Opens the interactive Vitest dashboard:

```bash
pnpm test:ui
```

#### Validate Multiple Emails

*(Note: This section is repurposed for Full Test Suite)*

Runs all unit tests with coverage reporting:

```bash
pnpm test
```

#### Debug Email Validation

*(Note: This section is repurposed for No-Coverage Testing)*

Runs tests quickly without generating coverage reports:

```bash
pnpm test:no-coverage
```

#### Test Typos

*(Note: This section is repurposed for Watch Mode)*

Runs tests in watch mode for active development:

```bash
pnpm test:watch
```

#### Test Link Crawling

*(Note: This section is repurposed for NPM Utility Tests)*

Tests the logic responsible for interacting with the NPM CLI:

```bash
pnpm test src/__tests__/npm.test.ts
```

#### Test Session Links

*(Note: This section is repurposed for Version Check Tests)*

Tests the Node.js and Git version detection logic:

```bash
pnpm test src/__tests__/versionCheck.test.ts
```

#### Email Generator Test

*(Note: This section is repurposed for Index Tests)*

Tests the main CLI orchestration flow:

```bash
pnpm test src/__tests__/index.test.ts
```

#### Test Cases

*(Note: This section is repurposed for Coverage Verification)*

Ensures all modules meet the 80% coverage threshold:

```bash
pnpm test --coverage
```

#### Sandbox

*(Note: This section is kept for general testing)*

Run specific files using tsx:

```bash
pnpm tsx src/utils/your-file.ts
```

## Quick Start Guide

### For Testing (Development Mode)

1. Open a terminal in the project root.
2. Run `pnpm install` to set up the environment.
3. Run `pnpm test` to ensure the baseline is stable.
4. Run `pnpm start` to perform a dry-run check of your packages.

### For Production Crawling

*(Note: This section is repurposed for Live Updates)*

1. Ensure you have administrative/sudo privileges (required for global npm updates).
2. Run `pnpm run start:live`.
3. Monitor the animated progress bars as packages are updated.
4. Review the final report for any manual Node.js or Git update requirements.

## File Structure

### Source Files (`src/`)

- `src/index.ts` - Main entry point and CLI orchestration
- `src/utils/npm.ts` - NPM CLI interaction and parsing logic
- `src/utils/versionCheck.ts` - External API integration for environment checks
- `src/utils/logger.ts` - Standardized terminal output and styling
- `src/__tests__/` - Comprehensive Vitest unit testing suite

### Output Files (`dist/`)

Compiled JavaScript files are placed in the `dist/` directory:

- `dist/index.js` - The executable entry point
- `dist/utils/*.js` - Compiled utility services

## Understanding the Console Status Line

*(Note: This section is repurposed for the Update Progress Line)*

When running, you'll see a real-time progress line for each package:

```
✔ Updated create-next-app | 16.2.3 -> 16.2.4 [1/6]
```

- **Status Icon**: `✔` for success, `✖` for failure
- **Package Name**: The name of the global package being updated
- **Version Change**: The transition from current version to target version
- **Progress Counter**: Your current position in the total update queue

## Troubleshooting

### Application Won't Start

- Ensure you are using Node.js v20 or higher.
- Run `pnpm install` to ensure all dependencies (ora, chalk, semver) are present.
- Check if `pnpm run build` completes without TypeScript errors.

### No Outdated Packages Found

- Verify you have global packages installed: `npm list -g --depth=0`.
- Run `npm outdated -g` manually to confirm if updates are available.

### Permission Denied Errors

- Global npm updates often require elevated permissions.
- Try running the terminal as Administrator (Windows) or using `sudo`.

### API Connection Errors

- Ensure you have an active internet connection for Node.js and Git version checks.
- Check if GitHub or Nodejs.org APIs are experiencing downtime.

### Version Comparison Issues

- The tool uses strict semver logic.
- Ensure your global packages follow standard semantic versioning.

## Important Notes

- The application sequentially updates packages to maintain system stability.
- Failed updates are logged at the end so you can investigate them individually.
- Node.js and Git updates must be performed manually as they involve system-level installers.
- High test coverage (80%+) is enforced to ensure the reliability of the update logic.

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag
