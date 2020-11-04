import { CommonUtil } from "../Util/CommonUtil";
import { Page, ElementHandle, Frame } from "puppeteer";
import { SelectorTypeEnum } from "../Define/Enum";
import {
  IDocumentSelector,
  ICrawledKV,
  ICommentsSelector,
  IDocumentEvalOption,
  IComment,
} from "../Define/Models";
import { StringUtil } from "../Util/StringUtil";
import { DatetimeUtil } from "../Util/DatetimeUtil";

/**
 * @description 문서 수집 클래스
 * @author Jay
 * @date 28/09/2020
 * @export
 * @class DocumentParser
 * @extends {CommonUtil}
 */
export class DocumentParser extends CommonUtil {
  /**
   * Creates an instance of DocumentParser.
   * @author Jay
   * @date 28/09/2020
   * @memberof DocumentParser
   */
  constructor() {
    super(__filename);
  }

  private ATTR: string = ":@:";
  private RGX: string = ":R:";
  private IN_FRAME: string = ":^:";

  /**
   * @description 셀럭터 타입 정의 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {string} _selector
   * @memberof DocumentParser
   */
  private SelectorDifiner = (_selector: string): SelectorTypeEnum => {
    let detectedSelectorType: SelectorTypeEnum = 0;

    if (_selector.includes(this.ATTR)) {
      detectedSelectorType = SelectorTypeEnum.ATTR;
    } else if (_selector.includes(this.RGX)) {
      detectedSelectorType = SelectorTypeEnum.RGX;
    } else if (_selector.includes(this.IN_FRAME)) {
      detectedSelectorType = SelectorTypeEnum.IN_IFRAME;
    } else {
      detectedSelectorType = SelectorTypeEnum.NORMAL;
    }

    return detectedSelectorType;
  };

  /**
   * @description FRAME 하위 HEADER 셀렉터 정의 함수. HEADER 는 제목,본문,날짜,댓글목록 등 수집에 필요한 최상위 NODE를 의미합니다.
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {Page} _page
   * @param {string[]} _frameSelectors
   * @param {string[]} _headerSelectors
   * @memberof DocumentParser
   */
  private ApplyHeaderselector = async (
    _page: Page,
    _frameSelectors: string[],
    _headerSelectors: string[]
  ): Promise<ElementHandle<Element> | null> => {
    let elementHandle: ElementHandle<Element> | null = null;

    if (_frameSelectors.length > 0) {
      CommonUtil.logger.debug(`<FRAME> SELECTOR MATCHING START`);
      for (let selector of _frameSelectors) {
        const iframeHandle: void | ElementHandle<
          Element
        > | null = await _page.$(selector).catch((err) => {
          CommonUtil.logger.debug(`${selector}\n⌙> NOT MATCHED : ${err}`);
        });

        if (iframeHandle !== undefined && iframeHandle !== null) {
          CommonUtil.logger.debug(`${selector}\n⌙> MATCHED`);
          elementHandle = iframeHandle;
          break;
        }
      }
    }

    CommonUtil.logger.debug(`<HEADER> SELECTOR MATCHING START`);
    for (let headerSelector of _headerSelectors) {
      let headerHandle: void | ElementHandle<Element> | null = null;

      if (elementHandle !== null) {
        const frame: Frame | null = await elementHandle.contentFrame();
        if (frame !== null) {
          headerHandle = await frame.$(headerSelector).catch((err) => {
            CommonUtil.logger.debug(
              `${headerSelector}\n⌙> NOT MATCHED  : ${err}`
            );
          });
        }
      } else {
        headerHandle = await _page.$(headerSelector).catch((err) => {
          CommonUtil.logger.debug(`${headerSelector}\n⌙>NOT MATCHED : ${err}`);
        });
      }

      if (headerHandle !== undefined && headerHandle !== null) {
        elementHandle = headerHandle;
        CommonUtil.logger.debug(`${headerSelector}\n⌙> MATCHED`);
      }
    }

    return elementHandle;
  };

  /**
   * @description 특수 전/후처리가 필요없는 일반 셀렉터 적용 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {ElementHandle<Element>} _eh
   * @param {string} _selectorName
   * @param {string} _selector
   * @memberof DocumentParser
   */
  private ApplyNormalSelector = async (
    _eh: ElementHandle<Element>,
    _selectorName: string,
    _selector: string
  ): Promise<string | null | void> => {
    CommonUtil.logger.debug(
      `NormalSelector => <${_selectorName.toUpperCase()}> SELECTOR MATCHING START [${_selector}]`
    );
    let text: string | null | void = "";

    if (_selectorName === "title" && _selector.length === 0) {
      CommonUtil.logger.debug(
        `THE CHANNEL MAT NOT HAVE TITLE, SO THE TITLE WILL BE SKIPPED.`
      );
      text = "NO_TITLE";
    } else {
      text = await _eh
        .$eval(_selector, (e: Element) => {
          return (e as HTMLElement).innerText;
        })
        .catch((err) => {
          CommonUtil.logger.debug(`${_selector}\n⌙> NOT MATCH : ${err}`);
        });

      if (text !== null && text !== undefined) {
        CommonUtil.logger.debug(`${_selector}\n⌙> MATCH :${text}`);
      }
    }

    return text;
  };

  /**
   * @description 수집해야할 NODE가 IFRAME안에 있어 전처리가 필요한 셀렉터 적용 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {ElementHandle<Element>} _eh
   * @param {string} _selectorName
   * @param {string} _selector
   * @memberof DocumentParser
   */
  private ApplyInFrameSelector = async (
    _eh: ElementHandle<Element>,
    _selectorName: string,
    _selector: string
  ): Promise<string | null | void> => {
    CommonUtil.logger.debug(
      `InFrameSelector => <${_selectorName.toUpperCase()}> SELECTOR MATCHING START [${_selector}]`
    );
    const splitedSelector: string[] = _selector.split(this.IN_FRAME);
    const frameSelector: string = splitedSelector[0];
    const textSelector: string = splitedSelector[1];

    let text: string | null | void = null;

    const frameHandle: void | ElementHandle<Element> | null = await _eh
      .$(frameSelector)
      .catch((err) => {
        CommonUtil.logger.debug(`${frameSelector}\n⌙> NOT MATCH ${err}`);
      });

    if (frameHandle !== null && frameHandle !== undefined) {
      CommonUtil.logger.debug(`${frameSelector}\n⌙> MATCH`);

      const frame: Frame | null = await frameHandle.contentFrame();
      if (frame !== null) {
        text = await frame
          .$eval(textSelector, (e: Element) => {
            return e.textContent;
          })
          .catch((err) => {
            CommonUtil.logger.debug(`${_selector}\n⌙> NOT MATCH : ${err}`);
          });

        if (text !== null && text !== undefined) {
          CommonUtil.logger.debug(`${_selector}\n⌙> MATCH : ${text}`);
        }
      }
    }

    return text;
  };

  /**
   * @description 필요 NODE가 getAttribute() 함수를 호출해야하는 셀렉터 적용 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {ElementHandle<Element>} _eh
   * @param {string} _selectorName
   * @param {string} _selector
   * @memberof DocumentParser
   */
  private ApplyAttrSelector = async (
    _eh: ElementHandle<Element>,
    _selectorName: string,
    _selector: string
  ): Promise<string | null> => {
    CommonUtil.logger.debug(
      `AttrSelector => <${_selectorName.toUpperCase()}> SELECTOR MATCHING START [${_selector}]`
    );
    const splitedSelector: string[] = _selector.split(this.ATTR);
    const selector: string = splitedSelector[0];
    const attrTag: string = splitedSelector[1];
    let joinAttr: string | null = null;

    const attrs: string[] | void = await _eh
      .$$eval(
        selector,
        (eArr: Element[], attrTag: string) => {
          const attrs: string[] = [];
          for (let idx = 0, len = eArr.length; idx < len; idx += 1) {
            const attr: string | null = eArr[idx].getAttribute(attrTag);
            if (attr !== null) {
              attrs.push(attr);
            }
          }

          return attrs;
        },
        attrTag
      )
      .catch((err) => {
        CommonUtil.logger.debug(`${_selector}\n⌙> NOT MATCH : ${err}`);
      });

    if (attrs !== undefined) {
      joinAttr = attrs.join(",");
      CommonUtil.logger.debug(`${_selector}\n⌙> MATCH : ${joinAttr}`);
    } else {
      joinAttr = null;
    }

    return joinAttr;
  };

  /**
   * @description 정규식 적용이 필요한 셀렉터 적용 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {ElementHandle<Element>} _eh
   * @param {string} _selectorName
   * @param {string} _selector
   * @memberof DocumentParser
   */
  private ApplyRegexSelector = async (
    _eh: ElementHandle<Element>,
    _selectorName: string,
    _selector: string
  ): Promise<string | null | void> => {
    CommonUtil.logger.debug(
      `RegexSelector => <${_selectorName.toUpperCase()}> SELECTOR MATCHING START [${_selector}]`
    );
    const splitedSelector: string[] = _selector.split(this.RGX);
    const selector: string = splitedSelector[0];
    const regexStr: string = splitedSelector[1];

    const text: string | void | null = await _eh
      .$eval(
        selector,
        (e: Element, regexStr: string) => {
          let text: string | null = e.textContent;
          if (text !== null) {
            const regex: RegExp = new RegExp(regexStr);
            const rgxExec: RegExpExecArray | null = regex.exec(text);
            if (rgxExec !== null) {
              text = rgxExec[1];
            }
          }

          return text;
        },
        regexStr
      )
      .catch((err) => {
        CommonUtil.logger.debug(`${_selector}\n⌙> NOT MATCH : ${err}`);
      });

    if (text !== null && text !== undefined) {
      CommonUtil.logger.debug(`${_selector}\n⌙> MATCH : ${text}`);
    }

    return text;
  };

  /**
   * @description 댓글 셀렉터 적용 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {ElementHandle<Element>} _eh
   * @param {ICommentsSelector} _commentsSelectors
   * @param {ICrawledKV} _crawledDoc
   * @memberof DocumentParser
   */
  private ApplyCommentsSelector = async (
    _eh: ElementHandle<Element>,
    _commentsSelectors: ICommentsSelector,
    _crawledDoc: ICrawledKV
  ): Promise<ICrawledKV> => {
    CommonUtil.logger.debug(`<COMMENT> SELECTOR MATCHING START`);

    const cmtListSelectors: string[] = _commentsSelectors.list.split(",");
    let cmtElementHandleList: ElementHandle<Element>[] | void | null = null;
    let comments: IComment[] = [];

    for (let cmtListSelector of cmtListSelectors) {
      cmtElementHandleList = await _eh.$$(cmtListSelector).catch((err) => {
        CommonUtil.logger.debug(`${cmtListSelector}\n⌙> NOT MATCH : ${err}`);
      });

      if (cmtElementHandleList !== undefined && cmtElementHandleList !== null) {
        CommonUtil.logger.debug(
          `${cmtListSelector}\n⌙> MATCH : TOTAL ${cmtElementHandleList.length} COMMENT LIST EXIST`
        );
        break;
      }
    }

    if (
      cmtElementHandleList !== undefined &&
      cmtElementHandleList !== null &&
      cmtElementHandleList.length > 0
    ) {
      const selectorKeys: string[] = Object.keys(_commentsSelectors);
      const secretOrDeleteTexts: string[] = _commentsSelectors.secretOrDeleteText.split(
        ","
      );
      const SKIP_SELECTOR_KEYS: string[] = [
        "list",
        "secretOrDeleteText",
        "cmtBoxOpenBtn",
      ];

      for (
        let idx = 0, len = cmtElementHandleList.length;
        idx < len;
        idx += 1
      ) {
        let isInvalid: boolean = false;

        CommonUtil.logger.debug(`SECRET OR DELETE COMMENT TEXT MATCHING START`);
        for (let secretOrDeleteText of secretOrDeleteTexts) {
          if (secretOrDeleteText.length > 0) {
            const commentWholeText: string = String(
              await (
                await cmtElementHandleList[idx].getProperty("innerText")
              ).jsonValue()
            );
            if (commentWholeText.includes(secretOrDeleteText)) {
              isInvalid = true;
              CommonUtil.logger.debug(`${secretOrDeleteText}\n⌙> MATCH`);
              break;
            }
          } else {
            break;
          }
        }

        if (isInvalid) {
          break;
        }

        const cmtObj: IComment = <IComment>{};

        for (let selectorKey of selectorKeys) {
          if (!SKIP_SELECTOR_KEYS.includes(selectorKey)) {
            const selectors: string = _commentsSelectors[selectorKey];
            const caseNeedSelectors: string[] = (selectors as string).split(
              ","
            );
            for (let caseNeedSelector of caseNeedSelectors) {
              let crawledValue: string | void | null = null;
              const dectedSelectorType: SelectorTypeEnum = this.SelectorDifiner(
                caseNeedSelector
              );
              switch (dectedSelectorType) {
                case SelectorTypeEnum.NORMAL:
                  crawledValue = await this.ApplyNormalSelector(
                    cmtElementHandleList[idx],
                    selectorKey,
                    caseNeedSelector
                  );
                  break;
                case SelectorTypeEnum.IN_IFRAME:
                  crawledValue = await this.ApplyInFrameSelector(
                    cmtElementHandleList[idx],
                    selectorKey,
                    caseNeedSelector
                  );
                  break;
                case SelectorTypeEnum.ATTR:
                  crawledValue = await this.ApplyAttrSelector(
                    cmtElementHandleList[idx],
                    selectorKey,
                    caseNeedSelector
                  );
                  break;
                case SelectorTypeEnum.RGX:
                  crawledValue = await this.ApplyRegexSelector(
                    cmtElementHandleList[idx],
                    selectorKey,
                    caseNeedSelector
                  );
                  break;
                default:
                  CommonUtil.logger.error(`DEFAULT CASE`);
                  break;
              }

              if (crawledValue !== null && crawledValue !== undefined) {
                if (selectorKey === "content") {
                  const stringUtil: StringUtil = StringUtil.getInstance();
                  cmtObj[selectorKey] = stringUtil.Replacer(crawledValue);
                } else {
                  cmtObj[selectorKey] = crawledValue;
                }

                break;
              }
            }

            if (cmtObj[selectorKey] === undefined) {
              cmtObj.error = `COMMENT ${selectorKey.toUpperCase()} SELECTOR IS NOT MATCH`;
              break;
            }
          }
        }

        if (cmtObj.error === undefined) {
          const datetimeUtil: DatetimeUtil = DatetimeUtil.getInstance();
          const parsedDatetime: string = datetimeUtil.DatetimeParser(
            cmtObj.datetime
          );
          const splitedDatetime: string[] = parsedDatetime.split(`-`);
          cmtObj.pub_year = splitedDatetime[0];
          cmtObj.pub_month = splitedDatetime[1];
          cmtObj.pub_day = splitedDatetime[2];
          cmtObj.pub_time = splitedDatetime[3];
          comments.push(cmtObj);
        } else {
          _crawledDoc.error = cmtObj.error;
          break;
        }
      }
    }

    if (_crawledDoc.error === undefined) {
      _crawledDoc.comments = comments;
    }

    return _crawledDoc;
  };

  /**
   * @description 문서 수집 처리 함수
   * @author Jay
   * @date 28/09/2020
   * @param {Page} _page
   * @param {IDocumentEvalOption} _evalOption
   * @param {IDocumentSelector} _ds
   * @param {ICommentsSelector} _cs
   * @memberof DocumentParser
   */
  public CrawlDocument = async (
    _page: Page,
    _evalOption: IDocumentEvalOption,
    _ds: IDocumentSelector,
    _cs: ICommentsSelector
  ): Promise<ICrawledKV> => {
    let crawledDoc: ICrawledKV = {};
    const SKIP_SELECTOR_KEYS: string[] = ["frame", "header", "image"];

    const isCrawlContent: boolean = Boolean(_evalOption.isContent);
    const isCrawlImage: boolean = Boolean(_evalOption.isImage);
    const isCrawlComment: boolean = Boolean(_evalOption.isComment);
    const selectorKeys: string[] = Object.keys(_ds);
    const stringUtil: StringUtil = StringUtil.getInstance();

    const eh: ElementHandle<Element> | null = await this.ApplyHeaderselector(
      _page,
      _ds.frame.split(","),
      _ds.header.split(",")
    );

    if (eh !== null) {
      for (let selectorkey of selectorKeys) {
        if (!SKIP_SELECTOR_KEYS.includes(selectorkey)) {
          const selectors: string | object = _ds[selectorkey];
          switch (selectorkey) {
            case "content":
              if (isCrawlContent) {
                const contentSelectors: string[] = (selectors as string).split(
                  ","
                );
                for (let contentSelector of contentSelectors) {
                  const crawledText:
                    | string
                    | void
                    | null = await this.ApplyNormalSelector(
                    eh,
                    selectorkey,
                    contentSelector
                  );
                  if (crawledText !== null && crawledText !== undefined) {
                    crawledDoc[selectorkey] = stringUtil.Replacer(crawledText);

                    if (isCrawlImage) {
                      const imageSelectors: string[] = (_ds.image as string).split(
                        ","
                      );
                      for (let imageSelector of imageSelectors) {
                        const mergedSelector: string = `${contentSelector} ${imageSelector}`;
                        const crawledImages:
                          | string
                          | void
                          | null = await this.ApplyAttrSelector(
                          eh,
                          "image",
                          mergedSelector
                        );
                        if (
                          crawledImages !== null &&
                          crawledImages !== undefined
                        ) {
                          crawledDoc.image = crawledImages;
                          break;
                        }
                      }

                      if (
                        crawledDoc.image === undefined ||
                        crawledDoc.image === null
                      ) {
                        crawledDoc.error = `IMAGE SELECTOR IS NOT MATCH`;
                      }
                    }

                    break;
                  }
                }
              }
              break;
            default:
              const caseNeedSelectors: string[] = (selectors as string).split(
                ","
              );
              for (let caseNeedSelector of caseNeedSelectors) {
                let crawledValue: string | void | null = null;
                const dectedSelectorType: SelectorTypeEnum = this.SelectorDifiner(
                  caseNeedSelector
                );
                switch (dectedSelectorType) {
                  case SelectorTypeEnum.NORMAL:
                    crawledValue = await this.ApplyNormalSelector(
                      eh,
                      selectorkey,
                      caseNeedSelector
                    );
                    break;
                  case SelectorTypeEnum.IN_IFRAME:
                    crawledValue = await this.ApplyInFrameSelector(
                      eh,
                      selectorkey,
                      caseNeedSelector
                    );
                    break;
                  case SelectorTypeEnum.ATTR:
                    crawledValue = await this.ApplyAttrSelector(
                      eh,
                      selectorkey,
                      caseNeedSelector
                    );
                    break;
                  case SelectorTypeEnum.RGX:
                    crawledValue = await this.ApplyRegexSelector(
                      eh,
                      selectorkey,
                      caseNeedSelector
                    );
                    break;
                  default:
                    CommonUtil.logger.error(`DEFAULT CASE`);
                    break;
                }

                if (crawledValue !== null && crawledValue !== undefined) {
                  if (selectorkey === "datetime") {
                    const datetimeUtil: DatetimeUtil = DatetimeUtil.getInstance();
                    const parsedDatetime: string = datetimeUtil.DatetimeParser(
                      crawledValue
                    );
                    const splitedDatetime: string[] = parsedDatetime.split(`-`);
                    crawledDoc[selectorkey] = parsedDatetime;
                    crawledDoc.pub_year = splitedDatetime[0];
                    crawledDoc.pub_month = splitedDatetime[1];
                    crawledDoc.pub_day = splitedDatetime[2];
                    crawledDoc.pub_time = splitedDatetime[3];
                  } else {
                    crawledDoc[selectorkey] = crawledValue;
                  }
                  break;
                }
              }

              break;
          }

          if (crawledDoc[selectorkey] === undefined) {
            crawledDoc.error = `${selectorkey.toUpperCase()} SELECTOR IS NOT MATCH`;
            break;
          }
        }
      }

      if (crawledDoc.error === undefined && isCrawlComment) {
        if (_cs.cmtBoxOpenBtn.length > 0) {
          const commentBoxSelector: string = _cs.cmtBoxOpenBtn;
          CommonUtil.logger.debug(`OPEN COMMENT BOX`);
          const cmtBoxOpenBtn: ElementHandle<
            Element
          > | null | void = await eh.$(commentBoxSelector).catch((err) => {
            CommonUtil.logger.debug(
              `${commentBoxSelector}\n⌙> NOT MATCH : ${err}`
            );
          });

          if (cmtBoxOpenBtn !== null && cmtBoxOpenBtn !== undefined) {
            await cmtBoxOpenBtn
              .click()
              .then(() => {
                CommonUtil.logger.debug(
                  `${commentBoxSelector}\n⌙> MATCHED : CLICKED SUCCESSFULLY`
                );
              })
              .catch((err) => {
                CommonUtil.logger.error(`CLICK FAILED ${err}`);
              });

            await _page.waitFor(1000);
          }
        }

        crawledDoc = await this.ApplyCommentsSelector(eh, _cs, crawledDoc);
      }
    } else {
      crawledDoc.error = `FRAME OR HEADER SELECTOR IS NOT MATCH`;
    }

    return crawledDoc;
  };
}
