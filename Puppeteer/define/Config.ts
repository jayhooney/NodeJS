/**
 * A puppeteerConf
 * @description  Puppeteer 모듈 설정에 필요한 옵션입니다.
 */
export const puppeteerConf = Object.freeze({
  CHARACTER_SET: "utf8",
  IS_HEADLESS: true,
  USER_AGENT:
    "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)",
  INTERVAL: 1000,
  VIEW_PORT_WIDTH: 1920,
  VIEW_PORT_HEIGHT: 1080,
  IS_COOKIES: true,
  IS_INTERCEPT: true,
  INTERCEPT_LIST: [
    // 'image',
    "media",
    "fetch",
    "eventsource",
    "stylesheet",
    "css",
    "font",
    "other"
  ],
  IS_JQUERY: true,
  JQUERY_URL: "https://code.jquery.com/jquery-3.2.1.min.js",
  PARSER_PATH: "./parser/"
});
