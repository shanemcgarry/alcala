import {AlcalaText} from './alcala-text.model';
import {AlcalaPerson} from './alcala-person.model';

export interface AlcalaSignoff {
  declaration: AlcalaText;
  signatories: AlcalaPerson[];
}
