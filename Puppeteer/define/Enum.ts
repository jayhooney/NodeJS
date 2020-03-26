/**
 * A stepEnum
 * @description 수집 단계별 프로세스를 구분하기 위한 Enum
 */
export const enum StepEnum {
  LIST = 0,
  DOCUMENT = 1
}

/**
 * A waitOptEnum
 * @description Puppeteer 모듈에서 사용할 wait 옵션 Enum
 */
export const enum WaitOptEnum {
  LOAD = "load",
  DOM_CONTENT_LOADED = "domcontentloaded",
  NETWORK_IDLE_0 = "networkidle0",
  NETWORK_IDLE_2 = "networkidle2"
}
