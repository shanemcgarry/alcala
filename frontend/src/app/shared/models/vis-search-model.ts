export class VisSearchParams {
  groupBy: string;
  userID: string;
  year?: number;
  topWords?: number;
  bottomWords?: number;
  keywords?: string;
  filteredCategories?: string[];

  constructor() {
    this.filteredCategories = [];
  }
}

