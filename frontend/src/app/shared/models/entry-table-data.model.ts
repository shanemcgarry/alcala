import { AlcalaEntry } from './alcala-entry.model';

export class EntryTableData {
  Description: string;
  Reales: number;
  Maravedises: number;
  Type: string;
  RowClass: string;
  constructor(entryData: AlcalaEntry, lang: string, type: string) {
    if (entryData.description != null) {
      if (lang === 'en') {
        this.Description = entryData.description.english;
      } else if (lang === 'es') {
        this.Description = entryData.description.spanish;
      }
    }
    this.Type = type;
    this.Reales = entryData.amount.reales;
    this.Maravedises = entryData.amount.maravedises;

    switch (this.Type) {
      case 'sum':
        this.RowClass = 'entryrow-sum';
        break;
      case 'adj':
        this.RowClass = 'entryrow-adj';
        break;
      default:
        this.RowClass = 'entryrow';
        break;
    }
  }
}
