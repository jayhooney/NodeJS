import Puppeteer, { Page, Dialog } from "puppeteer";

import { puppeteerConf } from "../define/Config";
import { LogUtil } from "./LogUtil";
import { StepEnum, WaitOptEnum } from "../define/Enum";
import { ListSelectorModel, DocumentSelectorModel } from "../define/Models";

import { GetLinkList, ICrawledLinkKV } from "../parser/List";
import { GetDocument, ICrawledDocKV } from "../parser/Document";
export class PageUtil {
  private static instance: PageUtil;
  private constructor() {}
  public static getInstance(): PageUtil {
    if (!PageUtil.instance) {
      PageUtil.instance = new PageUtil();
    }

    return PageUtil.instance;
  }

  private mLogger = LogUtil.getInstance().logger;

  private _mIsDialog: boolean = false;
  public get mIsDialog(): boolean {
    return this._mIsDialog;
  }
  public set mIsDialog(value: boolean) {
    this._mIsDialog = value;
  }

  /**
   * browser
   * @description puppeteer browser object를 캐싱할 전역변수
   * @type {browser}
   */
  public mBrowser!: Puppeteer.Browser;

  /**
   * init async function
   * @description puppeteer page 객체 초기화를 진행합니다.
   * @returns {Promise<Puppeteer.Page>}
   * @throws {Exception} 기타 예외가 발생했을 때
   */
  public init = async (): Promise<Puppeteer.Page> => {
    this.mBrowser = await Puppeteer.launch({
      headless: puppeteerConf.IS_HEADLESS
    });

    const page = await this.mBrowser.newPage();

    // 에이전트 세팅
    await page.setUserAgent(puppeteerConf.USER_AGENT);

    // 쿠키 사용여부
    if (puppeteerConf.IS_COOKIES) {
      await page.setCookie(...(await page.cookies()));
    }

    // 헤드리스 여부
    // 해당 옵션에 따라 웹 브라우저를 랜더링하여 출력한다.
    if (!puppeteerConf.IS_HEADLESS) {
      page.setViewport({
        width: puppeteerConf.VIEW_PORT_WIDTH,
        height: puppeteerConf.VIEW_PORT_HEIGHT
      });
    }

    // 인터셉트 여부
    // 해당 URL에 접근하여 리소스를 불러올 때
    // 불필요한 요소를 걸러낼 수 있다.
    if (puppeteerConf.IS_INTERCEPT) {
      await page.setRequestInterception(puppeteerConf.IS_INTERCEPT);
      page.on("request", intercept => {
        if (
          puppeteerConf.INTERCEPT_LIST.indexOf(intercept.resourceType()) !== -1
        ) {
          intercept.abort();
        } else {
          intercept.continue();
        }
      });
    }

    // JQuery 사용 여부
    if (puppeteerConf.IS_JQUERY) {
      await page.addScriptTag({ url: puppeteerConf.JQUERY_URL });
    }

    // 다이얼로그가 발생했을 때의 처리 이벤트 등록
    page.on("dialog", (dialog: Dialog) => {
      this.mLogger.info(`DIALOG MESSAGE : ${dialog.message()}`);
      this.mLogger.info(`DIALOG TYPE : ${dialog.type()}`);
      dialog.dismiss();
      this.mIsDialog = true;
    });

    return page;
  };

  /**
   * goToLink async function
   * @description page 이동을 처리합니다.
   * @param {page} _page
   * @param {string} _link 이동할 링크
   * @returns {(Promise<void> | Promise<number>)} 링크이동 결과
   */
  public goToLink = async (_page: Page, _link: string): Promise<string> => {
    let goToLinkResult: string;
    await _page
      .goto(_link, {
        waitUntil: WaitOptEnum.NETWORK_IDLE_2
      })
      .then(async ppterResponse => {
        if (ppterResponse !== null) {
          await _page
            .waitFor(puppeteerConf.INTERVAL)
            .then(() => {
              goToLinkResult = `good`;
            })
            .catch(err => {
              goToLinkResult = String(err);
              this.mLogger.error(`step wait > ${err}`);
            });
        } else {
          goToLinkResult = ppterResponse.statusText();
        }
      })
      .catch(err => {
        goToLinkResult = String(err);
        this.mLogger.error(`step gotolink > ${err}`);
      });

    return goToLinkResult;
  };

  /**
   * script inject async function
   * @description 현재 Step에 적절한 파서 스크립트를 인젝팅합니다.
   * @param {page} _page
   * @param {StepEnum} _step 단계
   * @returns {(Promise<void>)} 스크립트 인젝팅 결과
   * @throws {Exception} 기타 예외가 발생했을 때
   */
  public injecter = async (_page: Page, _step: StepEnum): Promise<string> => {
    let parserName: string;
    let goToLinkResult: string;
    switch (_step) {
      case StepEnum.LIST: {
        parserName = "List.js";
        break;
      }
      case StepEnum.DOCUMENT: {
        parserName = "Document.js";
        break;
      }
      default: {
        break;
      }
    }

    await _page
      .addScriptTag({ path: `${puppeteerConf.PARSER_PATH}${parserName}` })
      .then(() => {
        goToLinkResult = `good`;
      })
      .catch(err => {
        goToLinkResult = String(err);
        this.mLogger.error(`step add script tag > ${err}`);
      });

    return goToLinkResult;
  };

  /**
   * evaluateParser async function.
   * @description CSS Selector를 chromium에 적용합니다.
   * @param {page} _page
   * @param {number} _step 단계
   * @returns {Promise<object>} 크롤링된 요소들의 집합
   * @throws {invalidRule} CSS selector가 유효하지 않을 때
   * @throws {noResult} 추출 결과가 없을 때
   * @throws {exception} 기타 예외가 발생했을 때
   */
  public evaluateParser = async (
    _page: Page,
    _step: StepEnum,
    _selectors: ListSelectorModel | DocumentSelectorModel
  ): Promise<ICrawledLinkKV | ICrawledDocKV> => {
    let applySelectorFunctionName: string = "";
    switch (_step) {
      case StepEnum.LIST:
        applySelectorFunctionName = GetLinkList.toString();
        break;

      case StepEnum.DOCUMENT:
        applySelectorFunctionName = GetDocument.toString();
        break;

      default:
        this.mLogger.warn("default case");
        break;
    }

    let evaluateResult: ICrawledLinkKV | ICrawledDocKV = {};
    await _page
      .evaluate(
        (applySelectorFunctionName, selectors) => {
          const applySelectorFunction = new Function(
            " return (" + applySelectorFunctionName + ").apply(null, arguments)"
          );
          return applySelectorFunction.call(null, selectors);
        },
        applySelectorFunctionName,
        JSON.stringify(_selectors)
      )
      .then(result => {
        evaluateResult = result;
      })
      .catch(err => {
        evaluateResult[`ERROR`] = String(err);
        this.mLogger.error(`step evaluate > ${err}`);
      });

    return evaluateResult;
  };

  /**
   * closeAll async function
   * @description browser를 닫습니다.
   * @returns {(Promise<void>}
   * @throws {exception} 기타 예외가 발생했을 때
   */
  public closeAll = async (): Promise<void> => {
    const logger = LogUtil.getInstance().logger;
    await this.mBrowser.close().catch(err => {
      logger.error(`step browser close > ${err}`);
    });
  };
}
