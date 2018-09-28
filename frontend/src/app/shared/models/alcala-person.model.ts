import {AlcalaText} from './alcala-text.model';

export interface AlcalaPerson {
  id: string;
  fullName: string;
  foreName: string;
  surName: string;
  position: AlcalaText;
}
