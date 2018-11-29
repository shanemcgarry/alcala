import {SearchFeatures, SearchParams} from './search.model';
import {DataSummaryPackage} from './analysis-result';

export enum InfoBoxTypes {
  BiggestExpense = 'biggestExpense',
  MostFrequentExpense = 'mostFrequentExpense',
  BusiestMonth = 'busiestMonth',
  BusiestYear = 'busiestYear',
  SlowestMonth = 'slowestMonth',
  SlowestYear = 'slowestYear',
  MostExpensiveMonth = 'mostExpensiveMonth',
  MostExpensiveYear = 'MostExpensiveYear',
  LeastExpensiveMonth = 'leastExpensiveMonth',
  LeastExpensiveYear = 'leastExpensiveYear',
  MostFrequentWord = 'mostFrequentWord'
}
export interface CustomInfoBox {
  _id: string;
  userID: string;
  type: string;
  icon: string;
  label: string;
  colour: string;
}

export interface CustomChartInfo {
  _id: string;
  userID: string;
  title: string;
  description: string;
  searchParams: SearchParams;
  features: SearchFeatures;
  data: DataSummaryPackage;
}

export enum BoundaryObjectType {
  SearchResult = 'keyword',
  Chart = 'visualisation',
  Page = 'page'
}

export interface BoundaryObject {
  _id: string;
  userID: string;
  type: BoundaryObjectType;
  title: string;
  description: string;
  totalItems: number;
  params: SearchParams;
  features: SearchFeatures;
  pageID: string;
  dateCreated: Date;
}

export interface CustomDashboardInfo {
  _id: string;
  userID: string;
  infoBoxes: string[];
  charts: string[];
  stories: string[];
}
