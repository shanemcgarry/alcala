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
