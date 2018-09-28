export class PageSearch {
  searchPhrase: string;
  pageIndex: number;
  resultLimit: number;
  constructor(phrase: string, index: number, limit: number) {
    this.searchPhrase = phrase;
    this.pageIndex = index;
    this.resultLimit = limit;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}
