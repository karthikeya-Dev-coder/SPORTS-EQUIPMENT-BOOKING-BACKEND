import {
    type Logger as TLogger,
    createLogger,
    format,
    transports,
  } from "winston";
  
  const { combine, colorize, timestamp, align, printf } = format;
  
  // Custom format for terminal (colored)
  const consoleFormatter = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}] ${message}`;
  });

  // Custom format for files (plain text)
  const fileFormatter = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  });
  
  export class Logger {
    static logger: TLogger = createLogger({
      level: "info",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD hh:mm:ss.SSS A",
        }),
        align(),
      ),
      transports: [
        // Real-time terminal output (colored)
        new transports.Console({
          format: combine(colorize({ all: true }), consoleFormatter),
        }),
        // Error log file
        new transports.File({
          filename: "logs/error.log",
          level: "error",
          format: fileFormatter,
        }),
        // Combined log file
        new transports.File({
          filename: "logs/combined.log",
          format: fileFormatter,
        }),
      ],
    });
  
    static info(message: string | unknown): void {
      Logger.logger.info(message);
    }
  
    static error(message: string | unknown): void {
      Logger.logger.error(message);
    }
  
    static debug(message: string | unknown): void {
      Logger.logger.debug(message);
    }
  
    static warning(message: string | unknown): void {
      Logger.logger.warn(message);
    }
  }
