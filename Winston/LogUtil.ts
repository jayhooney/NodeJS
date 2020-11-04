import { createLogger, format, transports } from "winston";
import WinstonDaily from "winston-daily-rotate-file";
import Path from "path";
import Moment from "moment";
Moment().utcOffset("+09:00");

export class LogUtil {
  private static instance: LogUtil;
  private constructor() {}
  public static getInstance(): LogUtil {
    if (!LogUtil.instance) {
      LogUtil.instance = new LogUtil();
    }

    return LogUtil.instance;
  }

  private logDir: string = `${Path.basename(process.mainModule.filename)
    .replace(".js", "")
    .toUpperCase()}_LOG`;
  private mNodeEnv = process.env.NODE_ENV;

  public static logger = (_moduleName: string) =>
    createLogger({
      // 공통 옵션
      format: format.combine(
        format((info) => {
          info.level = info.level.toUpperCase().padStart(5, " ");
          return info;
        })(),
        format.colorize({
          all: true,
        }),
        format.label({
          label: `${Path.basename(_moduleName)
            .replace(".js", "")
            .padStart(12, " ")}`,
        }),
        format.timestamp({
          format: "HH:mm:ss",
        }),
        format.printf(
          (info) =>
            `| ${info.level} | ${info.timestamp} | ${info.label} >>> ${info.message} `
        )
      ),
      transports: [
        // 로그 출력 설정
        new transports.Console({
          level: this.mNodeEnv === "development" ? "debug" : "info",
        }),
        // 로그 파일 설정
        new WinstonDaily({
          format: format.uncolorize(),
          level: "debug",
          filename: `${this.logDir}/${Path.basename(process.mainModule.filename)
            .replace(".js", "")
            .toUpperCase()}_%DATE%.log`,
          datePattern: "YYYY-MM-DD",
          maxFiles: "30d",
        }),
      ],
    });
}

// 사용법
// import { LogUtil } from 'path/to/LogUtil'
// const logger = LogUtil.getInstance().logger(__filename)
