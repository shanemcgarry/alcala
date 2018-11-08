import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource, MatPaginator, MatSort} from '@angular/material';
import { CustomChartInfo } from '../../../models/custom-dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';
import { SearchService } from '../../../services/search.service';
import {SearchFeatures, SearchLogEntry, SearchParams} from '../../../models/search.model';
import { DataSummaryPackage } from '../../../models/analysis-result';
import { FormControl, Validators } from '@angular/forms';

export class VisualSearchLogEntry {
  _id: string;
  params: SearchParams;
  features: SearchFeatures;
  data: DataSummaryPackage;

  constructor(id: string, params: SearchParams, feature: SearchFeatures) {
    this._id = id;
    this.params = params;
    this.features = feature;
  }
}

@Component({
  selector: 'app-chart-dialog',
  templateUrl: './chart-dialog.component.html',
  styleUrls: ['./chart-dialog.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ]
})
export class ChartDialogComponent implements OnInit {
  searchLogs: SearchLogEntry[];
  tableData: MatTableDataSource<VisualSearchLogEntry>;
  chartData: DataSummaryPackage;
  expandedLog: VisualSearchLogEntry;
  displayColumns = ['chartType', 'xField', 'yField', 'groupBy', 'keywords', 'year', 'topWords', 'bottomWords', 'categories', 'select'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  titleFC = new FormControl('', [
    Validators.required
  ]);

  constructor(public dialogRef: MatDialogRef<ChartDialogComponent>, @Inject(MAT_DIALOG_DATA) public dataModel: CustomChartInfo,
              private dashboardService: DashboardService, private searchService: SearchService) { }

  ngOnInit() {
    if (!this.dataModel._id) {
      this.searchService.getSearchHistory(this.dataModel.userID, 'visualisation')
        .subscribe(
          data => {
            console.log(data.length);
            this.searchLogs = data;
            const vsData: VisualSearchLogEntry[] = [];
            data.forEach(l => {
              this.searchService.visualiseSearch(l.params, this.dataModel.userID, false)
                .subscribe(
                  chart => {
                    l.features.forEach(f => {
                      const newLog = new VisualSearchLogEntry(l._id, l.params, f);
                      newLog.data = chart;
                      vsData.push(newLog);
                    });
                  },
                  err => console.log(err),
                  () => {
                    this.tableData = new MatTableDataSource<VisualSearchLogEntry>(vsData);
                    this.tableData.paginator = this.paginator;
                    this.tableData.sort = this.sort;
                  }
                );
            });
            // If the user changes the sort order, reset back to the first page.
            // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
          },
          err => console.log(err),
          () => { console.log('search history loaded'); }
        );
    } else {
      this.searchService.visualiseSearch(this.dataModel.searchParams, this.dataModel.userID, false)
        .subscribe(
          data => this.chartData = data,
          err => console.log(err)
        );
    }
  }

  getDialogTitle(): string {
    let result: string;
    if (this.dataModel._id) {
      result = `Editing Chart: ${this.dataModel.title}`;
    } else {
      result = 'Add New Chart';
    }
    return result;
  }

  onChartSelect(id: string): void {
    const chartInfo = this.tableData.data.find(x => x._id === id);
    this.dataModel.searchParams = chartInfo.params;
    this.dataModel.features = chartInfo.features;
    this.chartData = chartInfo.data;
  }

  formatString (s: string) {
    return `${s.charAt(0).toUpperCase()}${s.substr(1)}`;
  }

  saveChanges(): void {
    this.dashboardService.saveUserChart(this.dataModel).subscribe(
      data => {
        this.dataModel = data;
        this.dialogRef.close(this.dataModel);
      }
    );
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  deleteObject(): void {
    this.dashboardService.deleteUserChart(this.dataModel).subscribe(
      x => {
        this.dataModel._id = null;
        this.dialogRef.close(this.dataModel);
      }
    );
  }

  convertSearchLogs(logs: SearchLogEntry[]): VisualSearchLogEntry[] {
    const result: VisualSearchLogEntry[] = [];
    logs.forEach(l => {
      this.searchService.visualiseSearch(l.params, this.dataModel.userID, false)
        .subscribe(
          data => {
            l.features.forEach(f => {
              const newLog = new VisualSearchLogEntry(l._id, l.params, f);
              newLog.data = data;
              result.push(newLog);
            });
          },
          err => console.log(err),
          () => console.log('chart data pulled')
        );
    });
    return result;
  }
}
