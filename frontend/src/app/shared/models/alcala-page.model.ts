import {AlcalaMonth} from './alcala-month.model';

export interface AlcalaPage {
  id: string;
  year: number;
  months: AlcalaMonth[];
}

