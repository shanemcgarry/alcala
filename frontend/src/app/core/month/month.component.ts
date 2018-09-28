import {Component, OnInit, Input, AfterContentChecked} from '@angular/core';
import { AlcalaMonth } from '../../shared/models/alcala-month.model';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss']
})
export class MonthComponent implements OnInit {
  @Input() dataModel: AlcalaMonth;
  @Input() currentLang: string;
  @Input() pageYear: number;
  constructor() {
  }

  ngOnInit() {
  }

   getMonthName(monthNum: number): string {
    const dtString = '2018-' + monthNum + '-15',
                dtFull = new Date(dtString),
                locale = 'en-uk';
    return dtFull.toLocaleDateString(locale, { month: 'long' });
  }
}
