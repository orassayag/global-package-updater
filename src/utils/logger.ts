import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(`${chalk.blue('ℹ')} ${message}`);
  }

  static success(message: string): void {
    console.log(`${chalk.green('✔')} ${message}`);
  }

  static warn(message: string): void {
    console.log(`${chalk.yellow('⚠')} ${message}`);
  }

  static error(message: string): void {
    console.log(`${chalk.red('✖')} ${message}`);
  }

  static section(title: string): void {
    const line = chalk.gray('─'.repeat(60));
    console.log(`\n${line}\n${chalk.bold(title)}\n${line}`);
  }
}
