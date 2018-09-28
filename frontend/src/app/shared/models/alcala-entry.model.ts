import {AlcalaText} from './alcala-text.model';
import {AlcalaAmount} from './alcala-amount.model';

export interface AlcalaEntry {
  amount: AlcalaAmount;
  description: AlcalaText;
}

export interface AlcalaSum {
  amount: AlcalaAmount;
  description: AlcalaText;
}
