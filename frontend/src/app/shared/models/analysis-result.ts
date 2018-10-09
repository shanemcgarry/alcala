import { Dictionary } from "lodash";
import {CategoryPivotItem, MonthYearPivotItem} from './pivot-data.model';

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

export interface AnalysisSummary {
  categoryBreakdown: CategoryPivotItem[];
  monthBreakdown: MonthYearPivotItem[];
  biggestExpense: CategoryPivotItem;
  mostExpensiveMonth: MonthYearPivotItem;
  leastExpensiveMonth: MonthYearPivotItem;
  busiestMonth: MonthYearPivotItem;
  wordFreq: any[];
}
