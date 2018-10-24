export class SearchParams {
  groupBy: string;
  year?: number;
  topWords?: number;
  bottomWords?: number;
  keywords?: string;
  filteredCategories?: string[];

  constructor() {
    this.filteredCategories = [];
  }
}

export class SearchFeatures {
  chartType: string;
  xField: string;
  yField: string;
  sizeField: string;
  groupField: string;
  pageIndex?: number;
  pageLimit?: number;
}

export interface SearchLogEntry {
  _id: string;
  type: string;
  userID: string;
  totalHits?: number;
  params: SearchParams;
  features: SearchFeatures[];
}

export class PageSearch {
  params: SearchParams = new SearchParams();
  pageIndex: number;
  resultLimit: number;
  userID: string;
  constructor(index: number, limit: number, userID?: string) {
    this.pageIndex = index;
    this.resultLimit = limit;
    this.userID = userID;
  }
}
