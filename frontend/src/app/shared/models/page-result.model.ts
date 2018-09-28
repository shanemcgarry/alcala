export interface PageResult {
  totalHits: number;
  searchPhrase: string;
  currentIndex: number;
  totalPageResults: number;
  resultLimit: number;
  pages: PageResultDetail[];
}

export interface PageResultDetail {
  id: string;
  title: string;
  matchesString: string;
  matchesArray: string[];
  textSnippet: string;
}

