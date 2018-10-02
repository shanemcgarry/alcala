import { Component, OnInit, OnChanges } from '@angular/core';
import { AnalysisSummary, AnalysisItem } from '../../shared/models/analysis-result';
import { ActivatedRoute } from '@angular/router';

import { cloneDeep, map, orderBy } from 'lodash';

import { VisualisationService } from '../service/visualisation.service';
import { SpinnerService } from '../../shared/services/spinner.service';
import { CategoryData, MonthYearPivotItem } from '../../shared/models/pivot-data.model';
import { SiteService } from '../../shared/services/site.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges {
  dataModel: AnalysisSummary;
  topWords: any[];
  stackAreaData: any[];
  multiBarData: any[];
  cumulativeLineData: any[];
  lineData: any[];
  pieData: any[];
  discreteBarData: any;
  dbTopWords: any[];
  pieTopWords: any[];
  leastFreqWords: any;
  scatterData: any;
  dateFormat = '%Y';
  selectedYear: any;
  summaryData: any;
  useCalculatedColours = false;
  categoryData: CategoryData[];
  rawData: AnalysisItem[];
  colourPalette: any[];
  validYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];

  constructor(private route: ActivatedRoute, private visService: VisualisationService, private spinnerService: SpinnerService, private siteService: SiteService) {
  }

  ngOnInit() {
    //this.siteService.clearCache();
    this.getCategoryData();
    this.getSummary(null);
    this.getRawData(null);
    // this.getCategoryByMonth();
    this.colourPalette = this.siteService.getColourPalette(3);
  }

  ngOnChanges() {
    this.colourPalette = this.siteService.getColourPalette(3);
  }


  yearChanged(eventObj) {
    this.getSummary(eventObj.value);
    this.getRawData(eventObj.value);
    this.getCategoryTimeData(eventObj.value);
    this.getCategoryBreakdown(eventObj.value);
  }

  getCategoryData(): void {
    this.visService.getCategoryData()
      .subscribe(
        data => {
          this.categoryData = data;
          this.getCategoryBreakdown(null);
          this.getCategoryTimeData(null);
        },
        err => console.log(err),
        () => console.log('Category Data loaded')
      );
  }

  getCategoryBreakdown(year: any): void {
    this.visService.getCategoryBreakdown(year)
      .subscribe(
        data => { this.formatCategoryBreakdownData(data); },
        err => console.log(err),
        () => console.log('Category Breakdown loaded')
      );
  }

  getRawData(year: any): void {
    this.visService.getRawData(year)
      .subscribe(
        data => {
          this.rawData = data;
        },
        err => console.log(err),
        () => console.log('Underlying model loaded')
      );
  }

  getMonthTitle(monthData: MonthYearPivotItem): string {
    if (this.selectedYear) {
      return monthData.month;
    } else {
      return `${monthData.month} ${monthData.year}`;
    }
  }

  getSummary(year: any): void {
    this.spinnerService.show('dashboardSpinner')
    this.visService.getDashboardSummary(year)
      .subscribe(
        data => {
            this.dataModel = data;
            this.formatWordFreq(data.wordFreq);
          },
        err => console.log(err),
        () => { console.log('Dashboard summary fetch complete.'); this.spinnerService.hide('dashboardSpinner'); }
      );
  }

  getCategoryTimeData(year: any): void {
    this.dateFormat = year ? '%b' : '%Y';
    this.spinnerService.show('dashboardSpinner')
    this.visService.getCategoryTimeData(year)
      .subscribe(
        data => {
          this.populateCategoryTimeCharts(data);
        },
        err => console.log(err),
        () => { console.log('CategoryTime fetch complete'); this.spinnerService.hide('dashboardSpinner'); }
      );
  }

  populateCategoryTimeCharts(data: any): void {
    this.summaryData = data.summary;
    this.formatStackAreaData(cloneDeep(data));
    this.formatCumulativeLineData(cloneDeep(data));
    this.formatLineData(cloneDeep(data));
    this.formatMultiBarData(cloneDeep(data));
  }

  formatScatterData(data: any): void {
    const self = this;
    const tempData = map(data, function(value, key) {
      const y = value['transactionSummary']['totalAmount'];
      const timeData = map(value['transactionSummary']['timeData'], function(v, k) {
        //const x = format
      });
    });
  }

  formatWordFreq(data: any): void {
    const colours = this.colourPalette;
    let i = 1;

    let orderedData = orderBy(data, ['frequency'], ['desc']);
    const tempData = map(orderedData, function(value, key) {
      let colour = colours[0];
      if (i % 2 === 0) {
        colour = colours[1];
      } else if (i % 3 === 0 ) {
        colour = colours[2];
      }
      i += 1;
      return { 'text': value['word'], 'weight': value['frequency'], 'color': colour['hex'] };
    });
    this.topWords = tempData.slice(0, 50);

    const dbData = map(orderedData, function(value, key) {
      return { 'key': value['word'], 'value': value['frequency'] };
    });
    this.dbTopWords = [{'key': 'Top 50 Words', 'values': dbData.slice(0, 10) }];
    this.pieTopWords = dbData.slice(0, 10);

    orderedData = orderBy(data, ['frequency'], ['asc']);
    const leastWords = map(orderedData, function(value, key) {
      return { 'key': value['word'], 'value': value['transactionSummary']['totalAmount'] };
    });

    this.formatScatterData(data);

  }

  formatForTimeTicks(date_value: number): any {
    if (this.selectedYear) {
      return new Date(1781, date_value - 1, 1).getTime();
    } else {
      return new Date(date_value,  0, 1).getTime();
    }
  }

  formatCategoryBreakdownData(data: any): void {
    const tempData: any[] = [];
    for (let x = 0; x < data.length; ++x) {
      tempData.push({ 'key': data[x].category, 'value': data[x].totalAmount,
                      'color':  this.getColour(data[x].category)});
    }
    this.pieData = tempData;
    this.formatDiscreteBarData();
  }

  formatDiscreteBarData(): void {
    const tempData: any[] = [];
    tempData.push({'key': 'Category Breakdown', 'values': this.pieData });
    this.discreteBarData = tempData;
  }

  formatMultiBarData(data: any): void {
    for (let x = 0; x < data.data.length; ++x) {
      const data_values = data.data[x].values;
      const summary_data = data.summary.timeGroup;
      data.data[x]['color'] = this.getColour(data.data[x].key);
      for (let y = 0; y < data_values.length; ++y) {
        const time_summary = summary_data.filter(t => t.key === data_values[y][0])[0];
        data_values[y][0] = this.formatForTimeTicks(data_values[y][0]);
        //data_values[y][1] = data_values[y][1] / time_summary.totalAmount;
      }
    }
    this.multiBarData = data.data;
  }

  formatStackAreaData(data: any): void {
    for (let x = 0; x < data.data.length; ++x) {
      const data_values = data.data[x].values;
      data.data[x]['color'] = this.getColour(data.data[x].key);
      for (let y = 0; y < data_values.length; ++y) {
        data_values[y][0] = this.formatForTimeTicks(data_values[y][0]);
      }
    }
    this.stackAreaData = data.data;
  }

  formatLineData(data: any): void {
    for (let x = 0; x < data.data.length; ++x) {
      const data_values = data.data[x].values;
      data.data[x]['color'] = this.getColour(data.data[x].key);
      for (let y = 0; y < data_values.length; ++y) {
        data_values[y][0] = this.formatForTimeTicks(data_values[y][0]);
      }
    }
    this.lineData = data.data;
  }

  formatCumulativeLineData(data: any): void {
    for (let x = 0; x < data.data.length; ++x) {
      const data_values = data.data[x].values;
      const summary_data = data.summary.timeGroup;
      data.data[x]['color'] = this.getColour(data.data[x].key);
      for (let y = 0; y < data_values.length; ++y) {
        const time_summary = summary_data.filter(t => t.key === data_values[y][0])[0];
        data_values[y][0] = this.formatForTimeTicks(data_values[y][0]);
        if (time_summary && time_summary.totalAmount > 0) {
          data_values[y][1] = data_values[y][1] / time_summary.totalAmount;
        }
      }
    }
    this.cumulativeLineData = data.data;
  }

  getColour(categoryName: string): string {
    if (this.useCalculatedColours) {
      return this.categoryData.filter(c => c.category === categoryName)[0].colour;
    } else {
      return '';
    }
  }

  shadeColour(hexColor, luminosity): string {
    // Taken from https://www.sitepoint.com/javascript-generate-lighter-darker-color/
    // Validate the hex string and convert it to 6 characters if necessary
    hexColor = String(hexColor).replace(/[^0-9a-f]/gi, '');
    if (hexColor.length < 6) {
      hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
    }

    luminosity = luminosity || 0;

    // Convert hex to decimal and modify luminosity
    let rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hexColor.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * luminosity)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }

    return rgb;
  }

}
