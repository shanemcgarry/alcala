import {Component, OnInit, OnChanges, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { AnalysisSummary, DataSummaryPackage } from '../../models/analysis-result';
import { ActivatedRoute, Router } from '@angular/router';

import { VisualisationService } from '../../../core/service/visualisation.service';
import { SearchParams } from '../../models/search.model';
import { LabelValue } from '../../models/visualisation.models';
import { ChartFactory } from '../chart/chart.factory';
import { MonthYearPivotItem } from '../../models/pivot-data.model';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-dashboard-sample',
  templateUrl: './dashboard-sample.component.html',
  styleUrls: ['./dashboard-sample.component.scss']
})
export class DashboardSampleComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chartsContainer') chartContainer: ElementRef;
  dataModel: AnalysisSummary;
  chartData: DataSummaryPackage;
  searchParams: SearchParams = new SearchParams();
  availableCharts: LabelValue[] = ChartFactory.getAllowableCharts();
  validYears = [1774, 1775, 1776, 1777, 1778, 1779, 1781];
  graphWidth = 750;

  constructor(private route: ActivatedRoute, private visService: VisualisationService, private searchService: SearchService, private router: Router) {
    this.searchParams.groupBy = 'category';
  }

  ngOnInit() {
    this.getDashboardData();
  }

  ngOnChanges() {
    this.getDashboardData();
  }

  ngAfterViewInit() {
    const chartContainerWidth = this.chartContainer.nativeElement.offsetWidth;
    this.graphWidth = (chartContainerWidth / 2) - (chartContainerWidth * .02);
  }

  getDashboardData() {
    this.searchService.visualiseSearch(this.searchParams)
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
    switch (fieldKey) {
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
