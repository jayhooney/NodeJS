import { createLogger, format, transports } from "winston";
import WinstonDaily from "winston-daily-rotate-file";
import Path from "path";
import Moment from "moment";
Moment().utcOffset("+09:00");

export class LogUtil {
  public static label: string = "";

  /**
   * Creates an instance of LogUtil.
   * @author Jay
   * @date 05/10/2020
   * @param {string} _filename
   * @memberof LogUtil
   */
  public constructor(_filename: string) {
    LogUtil.label = `${Path.basename(_filename)
      .replace(".js", "")
      .padStart(logConf.FILENAME_PAD_LEN, " ")}`;
  }

  /**
   * @description 윈스턴 로거 호출 함수
   * @author Jay
   * @date 05/10/2020
   * @protected
   * @static
   * @type {Logger}
   * @memberof LogUtil
   */
  protected static logger: Logger = createLogger({
    // 공통 옵션
    /**
     *  LEVEL
     * emerg: 0;
     * alert: 1;
     * crit: 2;
     * error: 3;
     * warning: 4;
     * notice: 5;
     * info: 6;
     * debug: 7;
     */
    levels: config.syslog.levels,
    format: format.combine(
      format((info) => {
        info.level = info.level
          .toUpperCase()
          .padStart(logConf.INFO_PAD_LEN, " ");
        return info;
      })(),
      format.splat()
    ),
    transports: [
      // 로그 출력 설정
      new transports.Console({
        level:
          String(process.env.NODE_ENV) === "development" ? "debug" : "info",
        format: format.combine(
          format.colorize({
            all: true,
          }),
          format.timestamp({
            format: logConf.CONSOLE_TIMESTAMP_FORMAT,
          }),
          format.printf(
            (info) =>
              `| ${info.level} | ${info.timestamp} | ${CommonUtil.label} |\n ${info.message} `
          )
        ),
      }),
      // 로그 파일 설정
      new WinstonDaily({
        level: logConf.LEVEL,
        filename: `LOG/${Path.basename(require.main!.filename)
          .replace(".js", "")
          .toUpperCase()}_%DATE%.log`,
        datePattern: logConf.LOG_FILE_DT_PATTERN,
        maxSize: 104857600,
        maxFiles: logConf.MAX_FILES,
        format: format.combine(
          format.uncolorize(),
          format.timestamp({
            format: logConf.FILE_TIMESTAMP_FORMAT,
          }),
          format.json()
        ),
        eol: ",\n",
      }),
    ],
  });
}
