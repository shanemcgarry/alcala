export interface CategoryPivotItem {
  category: string;
  reales: number;
  maravedises: number;
  transactionCount: number;
  total: number;
}

export interface CategoryMonthPivotItem {
  category: string;
  month: string;
  reales: number;
  maravedises: number;
  transactionCount: number;
  total: number;
}

export interface CategoryYearPivotItem {
  category: string;
  year: number;
  reales: number;
  maravedises: number;
  transactionCount: number;
  total: number;
}

export interface MonthYearPivotItem {
  month: string;
  year: number;
  reales: number;
  maravedises: number;
  transactionCount: number;
  total: number;
}

export interface AllDataPivotItem {
  month: string;
  category: string;
  year: number;
  reales: number;
  maravedises: number;
  transactionCount: number;
  total: number;
}

export interface WordFrequencyPivotItem {
  word: string;
  frequency: number;
  reales: number;
  maravedises: number;
  transactionCount: number;
  total: number;
}

export interface CategoryData {
  category: string;
  colour: string;
}
