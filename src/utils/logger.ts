enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: string
  timestamp: string
  message: string
  context?: Record<string, unknown>
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
    }

    if (level === LogLevel.ERROR) {
      console.error(JSON.stringify(entry))
    } else if (level === LogLevel.WARN) {
      console.warn(JSON.stringify(entry))
    } else if (level === LogLevel.INFO) {
      console.log(JSON.stringify(entry))
    } else if (this.isDev && level === LogLevel.DEBUG) {
      console.debug(JSON.stringify(entry))
    }
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context)
  }
}

export const logger = new Logger()
