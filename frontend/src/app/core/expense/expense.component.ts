import { Component, OnInit, Input } from '@angular/core';
import { AlcalaExpenditure } from '../../shared/models/alcala-expenditure.model';
import { EntryTableData } from '../../shared/models/entry-table-data.model';
import {d} from '@angular/core/src/render3';
import {AlcalaEntry} from '../../shared/models/alcala-entry.model';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})


export class ExpenseComponent implements OnInit {
  @Input() dataModel: AlcalaExpenditure;
  @Input() currentLang: string;
  tableEntries: EntryTableData[];
  columnsToDisplay = ['description', 'reales', 'maravedises']
  constructor() { }

  ngOnInit() {
    this.tableEntries = this.getTableData(this.currentLang);
  }

  getTableData(lang: string): EntryTableData[] {
    let tdData: EntryTableData[];
    tdData = [];
    this.dataModel.entries.forEach((item, index) => {
      const tdItem = new EntryTableData(item, lang, 'entry');
      tdData.push(tdItem);
    });
    if (this.dataModel.sum) {
      const tdSum = new EntryTableData(this.dataModel.sum, lang, 'sum');
      tdData.push(tdSum);
    }
    if (this.dataModel.adjustment) {
      const tdAdj = new EntryTableData(this.dataModel.adjustment, lang, 'adj');
      tdData.push(tdAdj);
    }
    return tdData;
  }

}
