export interface PageResult {
  totalHits: number;
  currentIndex: number;
  totalPageResults: number;
  resultLimit: number;
  searchID: string;
  pages: PageResultDetail[];
}

export interface PageResultDetail {
  id: string;
  title: string;
  matchesString: string;
  matchesArray: string[];
  textSnippet: string;
}

