export class PageSearch {
  searchPhrase: string;
  pageIndex: number;
  resultLimit: number;
  userID: string;
  constructor(phrase: string, index: number, limit: number, userID?: string) {
    this.searchPhrase = phrase;
    this.pageIndex = index;
    this.resultLimit = limit;
    this.userID = userID;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}
