type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = LOG_LEVELS["info"];

function formatMessage(
  level: LogLevel,
  context: string,
  message: string,
): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLogLevel;
}

export class Logger {
  static info(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("info")) {
      console.log(formatMessage("info", context, message), ...args);
    }
  }

  static error(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("error")) {
      console.error(formatMessage("error", context, message), ...args);
    }
  }

  static warn(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", context, message), ...args);
    }
  }

  static debug(context: string, message: string, ...args: unknown[]): void {
    if (shouldLog("debug")) {
      console.log(formatMessage("debug", context, message), ...args);
    }
  }
}
