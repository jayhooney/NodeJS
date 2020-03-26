/**
 * List Selector 인터페이스
 */
export interface IListSelector {
  list: string;
  link: string;
  linkAttr: string;
  noResult: string;
}
/**
 * A listSelectorModel
 * @description List CSS Selector 정보를 정의하는 모델
 */
export class ListSelectorModel {
  private _list: string;
  public get list(): string {
    return this._list;
  }
  public set list(value: string) {
    this._list = value;
  }

  private _link: string;
  public get link(): string {
    return this._link;
  }
  public set link(value: string) {
    this._link = value;
  }

  private _linkAttr: string;
  public get linkAttr(): string {
    return this._linkAttr;
  }
  public set linkAttr(value: string) {
    this._linkAttr = value;
  }

  private _noResult: string;
  public get noResult(): string {
    return this._noResult;
  }
  public set noResult(value: string) {
    this._noResult = value;
  }
}

/**
 * Document Selector 인터페이스
 */
export interface IDocumentSelector {
  frame: string[];
  document: string[];
  title: string[];
  content: string[];
  contentInIframe: string[];
  contentDt: string[];
  writer: string[];
}

/**
 * A documentSelectorModel
 * @description Document CSS Selector 정보를 정의하는 모델
 */
export class DocumentSelectorModel {
  private _frame: string[];
  public get frame(): string[] {
    return this._frame;
  }
  public set frame(value: string[]) {
    this._frame = value;
  }

  private _document: string[];
  public get document(): string[] {
    return this._document;
  }
  public set document(value: string[]) {
    this._document = value;
  }

  private _title: string[];
  public get title(): string[] {
    return this._title;
  }
  public set title(value: string[]) {
    this._title = value;
  }

  private _content: string[];
  public get content(): string[] {
    return this._content;
  }
  public set content(value: string[]) {
    this._content = value;
  }

  private _contentInIframe: string[];
  public get contentInIframe(): string[] {
    return this._contentInIframe;
  }
  public set contentInIframe(value: string[]) {
    this._contentInIframe = value;
  }

  private _contentDt: string[];
  public get contentDt(): string[] {
    return this._contentDt;
  }
  public set contentDt(value: string[]) {
    this._contentDt = value;
  }

  private _writer: string[];
  public get writer(): string[] {
    return this._writer;
  }
  public set writer(value: string[]) {
    this._writer = value;
  }
}
