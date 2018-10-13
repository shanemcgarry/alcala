import { Component, OnInit, OnChanges } from '@angular/core';
import { AnalysisSummary, DataSummaryPackage } from '../../shared/models/analysis-result';
import {ActivatedRoute, Router} from '@angular/router';

import { VisualisationService } from '../service/visualisation.service';
import { SpinnerService } from '../../shared/services/spinner.service';
import { SiteService } from '../../shared/services/site.service';
import {VisSearchParams} from '../../shared/models/vis-search-model';
import {LabelValue} from '../../shared/models/visualisation.models';
import {ChartFactory} from '../../shared/components/chart/chart.factory';
import {MonthYearPivotItem} from '../../shared/models/pivot-data.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges {
  dataModel: AnalysisSummary;
  chartData: DataSummaryPackage;
  searchParams: VisSearchParams = new VisSearchParams();
  availableCharts: LabelValue[] = ChartFactory.getAllowableCharts();
  validYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];

  constructor(private route: ActivatedRoute, private visService: VisualisationService, private router: Router) {
    this.searchParams.groupBy = 'category';
  }

  ngOnInit() {
    this.getDashboardData();
  }

  ngOnChanges() {
    this.getDashboardData();
  }

  getDashboardData() {
    this.visService.generateSearch(this.searchParams)
      .subscribe(
        data => this.chartData = data,
        err => console.log(err),
        () => console.log('Data Summary Package loaded')
      );
    this.visService.getDashboardSummary(this.searchParams.year)
      .subscribe(
        data => this.dataModel = data,
        err => console.log(err),
        () => console.log('Dashboard Summary Loaded')
      );
  }

  onCustomise(chartType: string) {
    this.router.navigate([`/visualise/search/${chartType}`]);
  }

  getFieldDefaults(chartType: string, fieldKey: string): string {
    const chartInfo = ChartFactory.createChart({'type': chartType});
    switch (fieldKey) {
      case 'x':
        return this.translateFieldKey(chartInfo.allowableXFields[0]);
      case 'y':
        return this.translateFieldKey(chartInfo.allowableYFields[0]);
      case 'size':
        return this.translateFieldKey(chartInfo.allowableSizeFields[0]);
      case 'group':
        return this.translateFieldKey(chartInfo.allowableGroupFields[0]);
      default:
        return undefined;
    }
  }

  private translateFieldKey(fieldKey: string) {
    let result;
    switch(fieldKey) {
      case 'time':
        if (this.searchParams.year) {
          result = 'monthNum';
        } else {
          result = 'year';
        }
        break;
      default:
        result = fieldKey;
        break;
    }
    return result;
  }

  getMonthTitle(monthData: MonthYearPivotItem): string {
    if (this.searchParams.year) {
      return monthData.month;
    } else {
      return `${monthData.month} ${monthData.year}`;
    }
  }

}
