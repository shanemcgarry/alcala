import {SearchFeatures, SearchParams} from './search.model';

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
}

export interface CustomStoryInfo {
  _id: string;
  userID: string;
  title: string;
  description: string;
  charts: CustomChartInfo[];
}

export interface CustomDashboardInfo {
  _id: string;
  userID: string;
  infoBoxes: CustomInfoBox[];
  charts: CustomChartInfo[];
  stories: CustomStoryInfo[];
}
