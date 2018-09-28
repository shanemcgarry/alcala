import {AlcalaEntry} from './alcala-entry.model';
import {AlcalaExpenditure} from './alcala-expenditure.model';
import {AlcalaSignoff} from './alcala-signoff.model';

export interface AlcalaMonth {
  month: number;
  expenses: AlcalaExpenditure[];
  subtotal: AlcalaEntry;
  otherAdjustments: AlcalaEntry;
  finalBalance: AlcalaEntry;
  signOff: AlcalaSignoff;
}
