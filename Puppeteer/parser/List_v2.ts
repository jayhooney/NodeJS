import { Page } from "puppeteer";
import { CommonUtil } from "../Util/CommonUtil";
import { DatetimeUtil } from "../Util/DatetimeUtil";
import {
  ILinkListSelector,
  ICrawledKV,
  ILinkListEvalOption,
} from "../Define/Models";
/**
 * @description 링크 리스트 파싱 클래스
 * @author Jay
 * @date 28/09/2020
 * @export
 * @class ListParser
 * @extends {CommonUtil}
 */
export class ListParser extends CommonUtil {
  /**
   * Creates an instance of ListParser.
   * @author Jay
   * @date 28/09/2020
   * @memberof ListParser
   */
  constructor() {
    super(__filename);
  }

  /**
   * @description 링크 수집중 더 이상 결과가 없음을 감지하는 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {Page} _page
   * @param {string} _noResultSelector
   * @param {string} _noResultTxt
   * @memberof ListParser
   */
  private ApplyNoResultSelector = async (
    _page: Page,
    _noResultSelector: string,
    _noResultTxt: string
  ): Promise<boolean> => {
    CommonUtil.logger.debug(`NO RESULT SELECTOR MATCHING START`);
    let isNoMoreList: boolean = true;

    if (_noResultSelector.length > 0) {
      isNoMoreList = await _page
        .$eval(
          _noResultSelector,
          (e: Element, noResulText: string) => {
            let isNoMoreList: boolean = true;
            const text: string = (e as HTMLElement).innerText;
            if (text !== noResulText) {
              isNoMoreList = false;
            }

            return isNoMoreList;
          },
          _noResultTxt
        )
        .catch((err) => {
          // 일단 다음 단계로 넘어가고 봐야하므로 false로 세팅.
          CommonUtil.logger.debug(`${_noResultSelector}\n⌙> NOT MATCH ${err}`);
          return false;
        });

      if (isNoMoreList === true) {
        CommonUtil.logger.debug(
          `${_noResultSelector}\n⌙> MATCH : NO MORE LIST DETECTED`
        );
      } else {
        CommonUtil.logger.debug(
          `${_noResultSelector}\n⌙> MATCH : MORE LIST EXIST`
        );
      }
    }

    return isNoMoreList;
  };

  /**
   * @description 링크 리스트 셀렉터 적용 함수
   * @author Jay
   * @date 28/09/2020
   * @private
   * @param {Page} _page
   * @param {string} _listSelector
   * @param {string} _linkSelector
   * @param {string} _linkDtSelector
   * @memberof ListParser
   */
  private ApplyLinkListSelector = async (
    _page: Page,
    _listSelector: string,
    _linkSelector: string,
    _linkDtSelector: string
  ): Promise<ICrawledKV[]> => {
    let linkObjArr: ICrawledKV[] = [];

    if (_listSelector.length > 0) {
      const tmpArr: ICrawledKV[] | void = await _page
        .$$eval(
          _listSelector,
          (eArr: Element[], linkSelector, linkDtSelector) => {
            const linkObjArr: ICrawledKV[] = [];
            for (let e of eArr) {
              const linkObj: ICrawledKV = <ICrawledKV>{
                link: (e.querySelector(linkSelector) as HTMLAnchorElement).href,
                linkDt:
                  linkDtSelector.length > 0
                    ? (e.querySelector(linkDtSelector) as HTMLAnchorElement)
                        .innerText
                    : "",
              };

              e.removeAttribute("href");

              linkObjArr.push(linkObj);
            }

            return linkObjArr;
          },
          _linkSelector,
          _linkDtSelector
        )
        .catch((err) => {
          CommonUtil.logger.debug(
            `${_listSelector} / ${_linkSelector} / ${_linkDtSelector}\n⌙> NOT MATCH ${err}`
          );
        });

      if (tmpArr !== undefined && tmpArr.length > 0) {
        for (let idx = 0, len = tmpArr.length; idx < len; idx += 1) {
          if ((tmpArr[idx].linkDt as string).length > 0) {
            tmpArr[idx].linkDt = DatetimeUtil.getInstance().DatetimeParser(
              tmpArr[idx].linkDt as string
            );
          }
          CommonUtil.logger.debug(
            `CRAWLED LINK : ${tmpArr[idx].link} DATETIME : ${tmpArr[idx].linkDt}`
          );
          linkObjArr.push(tmpArr[idx]);
        }
        CommonUtil.logger.debug(
          `${_listSelector} / ${_linkSelector} / ${_linkDtSelector}\n⌙> MATCH : TOTAL ${tmpArr.length} LINKS ARE CRAWLED`
        );
      }
    }

    return linkObjArr;
  };

  /**
   * @description 링크 리스트 수집 처리 함수
   * @author Jay
   * @date 28/09/2020
   * @param {Page} _page
   * @param {ILinkListEvalOption} _evalOption
   * @param {ILinkListSelector} _selector
   * @memberof ListParser
   */
  public CrawlLinkList = async (
    _page: Page,
    _evalOption: ILinkListEvalOption,
    _selector: ILinkListSelector
  ): Promise<ICrawledKV> => {
    let linkObj: ICrawledKV = <ICrawledKV>{};

    CommonUtil.logger.debug(`START MATCHING LINK LIST SELECTORS`);
    const isNoMoreList: boolean = await this.ApplyNoResultSelector(
      _page,
      _selector.noResult,
      _selector.noResultTxt
    );
    if (!isNoMoreList) {
      const linkObjArr: ICrawledKV[] = await this.ApplyLinkListSelector(
        _page,
        _selector.list,
        _selector.link,
        _selector.linkDt
      );
      if (!_evalOption.isPeriodSet) {
        CommonUtil.logger.debug(
          `Since the date cannot be specified, it is checked if it is greater than the collection start date.`
        );
        const datetimeUtil: DatetimeUtil = DatetimeUtil.getInstance();
        for (let idx = 0, len = linkObjArr.length; idx < len; idx += 1) {
          if (
            datetimeUtil.IsBetweenStartDtAndEndDt(
              linkObjArr[idx].linkDt as string,
              _evalOption.standardPeriodDt
            )
          ) {
            linkObj[idx] = linkObjArr[idx].link;
          }
        }
      } else {
        for (let idx = 0, len = linkObjArr.length; idx < len; idx += 1) {
          linkObj[idx] = linkObjArr[idx].link;
        }
      }
    } else {
      linkObj.isNoMoreList = isNoMoreList;
    }

    return linkObj;
  };
}
