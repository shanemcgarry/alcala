import {AlcalaText} from './alcala-text.model';
import {AlcalaEntry} from './alcala-entry.model';

export interface AlcalaExpenditure {
  entryType: string;
  title: AlcalaText;
  description: AlcalaText;
  entries: AlcalaEntry[];
  sum: AlcalaEntry;
  adjustment: AlcalaEntry;
}
