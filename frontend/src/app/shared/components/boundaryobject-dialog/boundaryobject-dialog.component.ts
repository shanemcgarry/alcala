import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BoundaryObject, BoundaryObjectType} from '../../models/custom-dashboard.model';
import {DashboardService} from '../../services/dashboard.service';
import {FormControl, Validators} from '@angular/forms';
import {ChartFactory} from '../chart/chart.factory';
import {LabelValue} from '../../models/visualisation.models';
import {PageResult} from '../../models/page-result.model';
import {DataSummaryPackage} from '../../models/analysis-result';
import {SearchService} from '../../services/search.service';

@Component({
  selector: 'app-boundaryobject-dialog',
  templateUrl: './boundaryobject-dialog.component.html',
  styleUrls: ['./boundaryobject-dialog.component.scss']
})
export class BoundaryobjectDialogComponent implements OnInit {
  titleFC = new FormControl('', Validators.required);
  boundaryObjectType = BoundaryObjectType;
  chartInfo: LabelValue;
  searchData: PageResult;
  chartData: DataSummaryPackage;
  showSpinner: boolean;
  showError = false;

  constructor(public dialogRef: MatDialogRef<BoundaryobjectDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dataModel: BoundaryObject,
              private dashboardService: DashboardService,
              private searchService: SearchService) { }

  ngOnInit() {
    this.showSpinner = true;
    switch (this.dataModel.type) {
      case this.boundaryObjectType.Chart:
        const chartList = ChartFactory.getAllowableCharts();
        this.chartInfo = chartList.find(x => x.value === this.dataModel.features.chartType);
        this.searchService.visualiseSearch(this.dataModel.params, null, false)
          .subscribe(
            x => {
              this.chartData = x;
              this.showSpinner = false;
            },
            err => {
              console.log(err);
              this.showSpinner = false;
            }
          );
        break;
      case this.boundaryObjectType.SearchResult:
        this.searchService.keywordSearch(this.dataModel.params, this.dataModel.features.pageIndex, this.dataModel.features.pageLimit, null, null, false)
          .subscribe(
            y => {
              this.searchData = y;
              this.showSpinner = false;
            },
            err => {
              console.log(err);
              this.showSpinner = false;
            }
          );
        break;
      default:
        this.showSpinner = false;
        break;
    }
  }

  calculatePageTotal(): number {
    return Math.floor(this.dataModel.totalItems / this.dataModel.features.pageLimit);
  }

  getDialogTitle(): string {
    return this.dataModel._id ? `Editing: ${this.dataModel.title}` : 'Add New Boundary Object';
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    this.showSpinner = true;
    this.showError = false;
    this.dashboardService.saveBoundaryObject(this.dataModel)
      .subscribe(
        data => {
          this.dataModel = data;
          this.showSpinner = false;
          this.dialogRef.close(this.dataModel);
        },
        err => {
          console.log(err);
          this.showSpinner = false;
          this.showError = true;
        }
      );
  }

  deleteObject(): void {
    this.showSpinner = false;
    this.showError = false;
    this.dashboardService.deleteBoundaryObject(this.dataModel)
      .subscribe(
        data => {
          this.showSpinner = false;
          this.dataModel._id = null;
          this.dialogRef.close(this.dataModel);
        },
        err => {
          this.showSpinner = false;
          this.showError = true;
        }
      );
  }

  hasErrors(): boolean {
    let result = false;
    if (this.titleFC.hasError('required')) {
      result = true;
    }
    return result;
  }

}
