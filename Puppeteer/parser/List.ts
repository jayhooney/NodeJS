export interface ICrawledLinkKV {
  [key: number]: string;
}

function ApplyNoResultSelector(selector: string): boolean {
  let isExsistsList: boolean = true;
  if (selector.length > 0) {
    const noResultElement: Element | null = document.querySelector(selector);
    if (noResultElement !== null) {
      isExsistsList = false;
    }
  }

  console.log("is exsists list ?" + isExsistsList);
  return isExsistsList;
}

function ApplyListSelector(selector: string): NodeListOf<Element> | null {
  let linksElement: NodeListOf<Element> | null = null;
  if (selector.length > 0) {
    const tmpLinksElement: NodeListOf<Element> = document.querySelectorAll(
      selector
    );
    if (tmpLinksElement.length > 0) linksElement = tmpLinksElement;
  }

  console.log("ilinksElement " + linksElement);
  return linksElement;
}

function ApplyLinkSelector(
  linksElement: NodeListOf<Element> | null,
  linkSelector: string,
  linkAttrSelector: string
): ICrawledLinkKV {
  let linkObj: ICrawledLinkKV = {};
  if (
    linkSelector.length > 0 &&
    linkAttrSelector.length > 0 &&
    linksElement !== null
  ) {
    for (let idx = 0, len = linksElement.length; idx < len; idx += 1) {
      const link: string | null | undefined = linksElement[idx]
        .querySelector(linkSelector)
        ?.getAttribute(linkAttrSelector);
      if (link !== null && link !== undefined) linkObj[idx] = link;
    }
  }

  console.log("linkObj " + linkObj);
  return linkObj;
}

export function GetLinkList(selectorsStr: string): ICrawledLinkKV {
  const selectors = JSON.parse(selectorsStr);
  let linksObj: ICrawledLinkKV = {};
  if (ApplyNoResultSelector(selectors._noResult)) {
    const linksElement: NodeListOf<Element> | null = ApplyListSelector(
      selectors._list
    );
    if (linksElement !== null) {
      linksObj = ApplyLinkSelector(
        linksElement,
        selectors._link,
        selectors._linkAttr
      );
    }
  }

  return linksObj;
}
