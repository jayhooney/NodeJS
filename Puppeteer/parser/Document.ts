export interface ICrawledDocKV {
  [key: string]: string;
}

function replacer(text: string): string {
  const replacedText = text
    .replace(
      /[^(\{\}\[\]\/\:\+=_<>!@#\$%\^&\*\(\)\-\.\,\;\'\"\＜\a-zA-Z0-9ㄱ-ㅎ가-힣\s)]/gi,
      ""
    )
    .replace(/\＜/g, "")
    .replace(/\＞/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\'/g, "'")
    .replace(/\&/g, "&")
    .replace(/\r/g, "")
    .replace(/\t/g, "")
    .replace(/\b/g, "")
    .replace(/\f/g, "")
    .replace(/\"/g, '"')
    .replace(/\b/g, "")
    .replace(/[\u0003]+/g, "")
    .replace(/[\u0005]+/g, "")
    .replace(/[\u007F]+/g, "")
    .replace(/[\u001a]+/g, "")
    .replace(/[\u001e]+/g, "")
    .replace(/[\u0000-\u0019]+/g, "")
    .replace(/[\u001A]+/g, "");

  return replacedText;
}

function ApplyFrameSelector(selectors: string[]): Document | null {
  let documentElement: Document | null = null;

  if (selectors.length > 0) {
    for (let selector of selectors) {
      const frameElement:
        | HTMLFrameElement
        | HTMLIFrameElement = document.querySelector(selector);
      if (frameElement !== null) {
        const tmpDocument: Document | null = frameElement.contentDocument;
        if (tmpDocument !== null) {
          documentElement = tmpDocument;
          break;
        }
      }
    }
  }

  console.log(documentElement);
  return documentElement;
}

function ApplyDocumentSelector(
  documentElement: Document | null,
  selectors: string[]
): Element | null {
  let element: Element | null = null;

  if (selectors.length > 0) {
    for (let selector of selectors) {
      let tmpElement: Element | null = null;

      documentElement !== null
        ? (tmpElement = documentElement.querySelector(selector))
        : (tmpElement = document.querySelector(selector));

      if (tmpElement !== null) {
        element = tmpElement;
        break;
      }
    }
  }
  console.log(documentElement);
  return element;
}

function ApplyContentInIframeSelector(
  parentElement: Element,
  selectors: string[]
): string {
  let value: string | null = null;
  if (selectors.length > 0) {
    for (let selector of selectors) {
      const splitedSelector: string[] = selector.split("^");
      const tmpDocument: Document | null = (parentElement.querySelector(
        splitedSelector[0]
      ) as HTMLFrameElement | HTMLIFrameElement).contentDocument;
      if (tmpDocument !== null) {
        value = (tmpDocument.querySelector(splitedSelector[1]) as HTMLElement)
          .innerText;
        value = replacer(value);
        break;
      }
    }
  }
  return value;
}

function ApplyNormalSelector(
  parentElement: Element,
  selectors: string[]
): string | null {
  let value: string | null = null;
  if (selectors.length > 0) {
    for (let selector of selectors) {
      const childElement: Element | null = parentElement.querySelector(
        selector
      );

      if (childElement !== null) {
        value = (childElement as HTMLElement).innerText;
        value = replacer(value);
        break;
      }
    }
  }

  return value;
}

export function GetDocument(documentSelectors: string): ICrawledDocKV {
  let crawledDoc: ICrawledDocKV = {};
  const selectors = JSON.parse(documentSelectors);
  const selectorKeys: string[] = Object.keys(selectors);

  let htmlContentDocument: Document | null = null;
  let parentElement: Element | null = null;

  let crawledValue: string | null = null;
  let isExistsDocumentElement: boolean = true;

  for (let idx = 0, len = selectorKeys.length; idx < len; idx += 1) {
    if (isExistsDocumentElement) {
      switch (selectorKeys[idx]) {
        // special case
        case "_frame":
          const tmpDocument: Document | null = ApplyFrameSelector(
            selectors[selectorKeys[idx]]
          );
          if (tmpDocument !== null) htmlContentDocument = tmpDocument;
          break;
        case "_document":
          const tmpElement = ApplyDocumentSelector(
            htmlContentDocument,
            selectors[selectorKeys[idx]]
          );
          if (tmpElement !== null) {
            parentElement = tmpElement;
          } else {
            // frame 또는 document 셀렉터가 유효하지 않은 경우.
            crawledDoc[`ERROR`] = `${selectorKeys[idx - 1]} OR ${
              selectorKeys[idx]
            }`;
            isExistsDocumentElement = false;
          }
          break;
        case "_contentInIframe":
          crawledValue = ApplyContentInIframeSelector(
            parentElement,
            selectors[selectorKeys[idx]]
          );
          // 크롤링된 값이 null이 아닌경우 => 정상 수집
          if (crawledValue !== null) {
            crawledDoc[
              selectorKeys[idx].replace(`_`, ``).replace(`InIframe`, ``)
            ] = crawledValue;
          }
          // 셀렉터는 존재하지만 크롤링된 문자열이 없는 경우 => RULE 에러임.
          //  `ERROR` : `something error message` 꼴로 반환해야함.
          if (
            selectors[selectorKeys[idx]].length > 0 &&
            crawledValue === null
          ) {
            crawledDoc[`ERROR`] += `${selectorKeys[idx]}`;
          }
          break;
        // normal case
        case "_title":
        case "_content":
        case "_contentDt":
        case "_writer":
          crawledValue = ApplyNormalSelector(
            parentElement,
            selectors[selectorKeys[idx]]
          );
          // 셀렉터도 존재하고 크롤링된 문자열도 있는 경우 => 정상 수집
          if (crawledValue !== null) {
            crawledDoc[selectorKeys[idx].replace(`_`, ``)] = crawledValue;
          }
          // 셀렉터는 존재하지만 크롤링된 문자열이 없는 경우 => RULE 에러임.
          //  `ERROR` : `something error message` 꼴로 반환해야함.
          if (
            selectors[selectorKeys[idx]].length > 0 &&
            crawledValue === null
          ) {
            crawledDoc[`ERROR`] += `${selectorKeys[idx]}`;
          }
          break;
        default:
          break;
      }
    } else {
      break;
    }
  }

  return crawledDoc;
}
