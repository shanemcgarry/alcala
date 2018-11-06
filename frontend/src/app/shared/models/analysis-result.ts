import {CategoryPivotItem, MonthYearPivotItem, YearPivotItem} from './pivot-data.model';

export interface AnalysisResult {
  hits: number;
  search_phrase: string;
  items: AnalysisItem[];
}

export interface AnalysisItem {
  categories: string[];
  maravedises: number;
  reales: number;
  pageid: string;
  month: number;
  monthName: number;
  year: number;
  words: string[];
}

export interface TimeSummary {
  timeValue: number;
  timeType: string;
  reales: number;
  maravedises: number;
  totalAmount: number;
  transactionCount: number;
}

export interface SummaryInfo {
  reales: number;
  maravedises: number;
  grandTotal: number;
  totalTransactions: number;
  timeSummary: TimeSummary[];
}

export interface DataSummaryPackage {
  summary: SummaryInfo;
  data: KeyTimePivotData[];
  rawData: AnalysisItem[];
  searchID: string;
}

export interface TimeSeriesData {
  timeValue: number;
  timeType: string;
  totalAmount: number;
  transactionCount: number;
}

export interface KeyTimePivotData {
  key: string;
  frequency: number;
  timeSeries: TimeSeriesData[];
}

export interface AnalysisUserItem {
  categories: string[];
  maravedises: number;
  reales: number;
  pageid: string;
  month: number;
  monthName: number;
  year: number;
  words: string[];
  userId: string;
}

export interface WordFrequncyInfo {
  word: string;
  frequency: number;
}

export interface AnalysisSummary {
  categoryBreakdown: CategoryPivotItem[];
  monthBreakdown: MonthYearPivotItem[];
  biggestExpense: CategoryPivotItem;
  mostFrequentExpense: CategoryPivotItem;
  mostExpensiveMonth: MonthYearPivotItem;
  mostExpensiveYear: YearPivotItem;
  leastExpensiveMonth: MonthYearPivotItem;
  leastExpensiveYear: YearPivotItem;
  busiestMonth: MonthYearPivotItem;
  busiestYear: YearPivotItem;
  slowestMonth: MonthYearPivotItem;
  slowestYear: YearPivotItem;
  mostFrequentWord: WordFrequncyInfo;
  wordFreq: any[];
}
