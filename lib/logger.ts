export interface Logger {
  info(message: string, extra?: any): void;
  error(message: string, extra?: any): void;
  debug(message: string, extra?: any): void;
  warn(message: string, extra?: any): void;
  fatal(message: string, extra?: any): void;
}

export const logger: Logger = {
  info(message, extra) {
    console.info(message, extra || "");
  },
  error(message, extra) {
    console.error(message, extra || "");
  },
  debug(message, extra) {
    console.debug(message, extra || "");
  },
  warn(message, extra) {
    console.warn(message, extra || "");
  },
  fatal(message, extra) {
    console.error(message, extra || "");
  },
};
