import { Component, OnInit } from '@angular/core';
import {
  BoundaryObject, BoundaryObjectType,
  CustomChartInfo,
  CustomDashboardInfo,
  CustomInfoBox,
  InfoBoxTypes
} from '../../models/custom-dashboard.model';
import {DashboardService} from '../../services/dashboard.service';
import {UserService} from '../../services/user.service';
import {SiteUser} from '../../models/site-user.model';
import {SearchService} from '../../services/search.service';
import {MatDialog} from '@angular/material';
import {InfoboxDialogComponent} from '../dashboard-dialogs/infobox-dialog/infobox-dialog.component';
import {AnalysisSummary} from '../../models/analysis-result';
import {VisualisationService} from '../../../core/service/visualisation.service';
import {CategoryPivotItem, MonthYearPivotItem, YearPivotItem} from '../../models/pivot-data.model';
import {ChartDialogComponent} from '../dashboard-dialogs/chart-dialog/chart-dialog.component';

@Component({
  selector: 'app-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {
  maxInfoBoxes = 4;
  maxCharts = 4;
  dataModel: CustomDashboardInfo;
  infoBoxes: CustomInfoBox[];
  charts: CustomChartInfo[];
  boundaryObjects: BoundaryObject[];
  userInfo: SiteUser;
  boxData: AnalysisSummary;
  boundaryObjectType = BoundaryObjectType;

  constructor(private dashboardService: DashboardService, private userService: UserService, private searchService: SearchService,
              private visualisationService: VisualisationService, public dialog: MatDialog) {
    this.userInfo = this.userService.getLoggedInUser();
  }

  ngOnInit() {
    this.dashboardService.getUserDashboard(this.userInfo._id)
      .subscribe(
        data => {
            this.dataModel = data;
            if (!this.dataModel || !this.dataModel._id) {
              this.dataModel = {
                _id: undefined,
                userID: this.userInfo._id,
                infoBoxes: [],
                charts: [],
                stories: [],
              };
            }
          },
        err => console.log(err),
        () => { console.log('Dashboard Data Loaded'); }
      );
    this.visualisationService.getDashboardSummary(undefined)
      .subscribe(
        summary => this.boxData = summary,
        err => console.log(err),
        () => console.log('InfoBox Data loaded')
      );
    this.dashboardService.getInfoBoxes(this.userInfo._id)
      .subscribe(
        data => this.infoBoxes = data,
        err => console.log(err),
        () => { console.log('Infoboxes Loaded'); }
      );
    this.dashboardService.getUserCharts(this.userInfo._id)
      .subscribe(
        data => this.charts = data,
        err => console.log(err),
        () => console.log('charts loaded')
      );
  }

  addInfoBox(): void {
    const infoBoxData: CustomInfoBox = {
      _id: null,
      userID: this.userInfo._id,
      type: null,
      icon: null,
      label: null,
      colour: null
    };
    const dialogRef = this.dialog.open(InfoboxDialogComponent, { data: infoBoxData });
    dialogRef.afterClosed().subscribe(result => {
        if (result && result._id) {
          if (!this.dataModel.infoBoxes) {
            console.log('infoboxes instantiated');
            this.dataModel.infoBoxes = [];
          }
          console.log(result);
          this.dataModel.infoBoxes.push(result._id);
          this.saveDashboard();
          this.infoBoxes.push(result);
        }
      }
    );
  }

  editInfoBox(id: string): void {
    let infoBoxData = this.infoBoxes.find(x => x._id === id);
    const dialogRef = this.dialog.open(InfoboxDialogComponent, { data: infoBoxData });
    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        if (result._id) {
          infoBoxData = result;
        } else {
          this.infoBoxes.splice(this.infoBoxes.findIndex(x => x._id === id), 1);
          this.dataModel.infoBoxes.splice(this.dataModel.infoBoxes.findIndex(x => x === id), 1);
          this.saveDashboard();
        }
      }
    });
  }

  saveDashboard(): void {
    this.dashboardService.saveUserDashboard(this.dataModel)
      .subscribe(
        x => this.dataModel = x,
        err => console.log(err),
        () => console.log('Dashboard saved.')
      );
  }

  getInfoBoxSubType(dataType: string, infoBoxType: string): string {
    let result;
    switch (this.convertToInfoBoxType(infoBoxType)) {
      case InfoBoxTypes.BiggestExpense:
        result = dataType === 'data' ? 'category' : 'totalAmount';
        break;
      case InfoBoxTypes.BusiestMonth:
        result = dataType === 'data' ? 'month' : 'transactionCount';
        break;
      case InfoBoxTypes.BusiestYear:
        result = dataType === 'data' ? 'year' : 'transactionCount';
        break;
      case InfoBoxTypes.LeastExpensiveMonth:
        result = dataType === 'data' ? 'month' : 'totalAmount';
        break;
      case InfoBoxTypes.LeastExpensiveYear:
        result = dataType === 'data' ? 'year' : 'totalAmount';
        break;
      case InfoBoxTypes.MostExpensiveMonth:
        result = dataType === 'data' ? 'month' : 'totalAmount';
        break;
      case InfoBoxTypes.MostExpensiveYear:
        result = dataType === 'data' ? 'year' : 'totalAmount';
        break;
      case InfoBoxTypes.MostFrequentExpense:
        result = dataType === 'data' ? 'category' : 'transactionCount';
        break;
      case InfoBoxTypes.SlowestMonth:
        result = dataType === 'data' ? 'month' : 'transactionCount';
        break;
      case InfoBoxTypes.SlowestYear:
        result = dataType === 'data' ? 'year' : 'transactionCount';
        break;
      case InfoBoxTypes.MostFrequentWord:
        result = 'frequency';
        break;
      default:
        throw new Error (`${infoBoxType} has not been implemented.`);
    }
    return result;
  }

  getInfoBoxData(dataType: string, infoBoxType: string): any {
    let result: any;
    const subType = this.getInfoBoxSubType(dataType, infoBoxType);
    switch (this.convertToInfoBoxType(infoBoxType)) {
      case InfoBoxTypes.BiggestExpense:
        result = this.getDataItem(dataType, this.boxData.biggestExpense, subType);
        break;
      case InfoBoxTypes.BusiestMonth:
        result = this.getDataItem(dataType, this.boxData.busiestMonth, subType);
        break;
      case InfoBoxTypes.BusiestYear:
        result = this.getDataItem(dataType, this.boxData.busiestYear, subType);
        break;
      case InfoBoxTypes.LeastExpensiveMonth:
        result = this.getDataItem(dataType, this.boxData.leastExpensiveMonth, subType);
        break;
      case InfoBoxTypes.LeastExpensiveYear:
        result = this.getDataItem(dataType, this.boxData.leastExpensiveYear, subType);
        break;
      case InfoBoxTypes.MostExpensiveMonth:
        result = this.getDataItem(dataType, this.boxData.mostExpensiveMonth, subType);
        break;
      case InfoBoxTypes.MostExpensiveYear:
        result = this.getDataItem(dataType, this.boxData.mostExpensiveYear, subType);
        break;
      case InfoBoxTypes.MostFrequentExpense:
        result = this.getDataItem(dataType, this.boxData.mostFrequentExpense, subType);
        break;
      case InfoBoxTypes.SlowestMonth:
        result = this.getDataItem(dataType, this.boxData.slowestMonth, subType);
        break;
      case InfoBoxTypes.SlowestYear:
        result = this.getDataItem(dataType, this.boxData.slowestYear, subType);
        break;
      case InfoBoxTypes.MostFrequentWord:
        switch (dataType) {
          case 'count':
            result = this.boxData.mostFrequentWord.frequency;
            break;
          case 'data':
            result = this.formatString(this.boxData.mostFrequentWord.word);
            break;
          default:
            throw new Error(`${dataType} is not a valid option for Most Frequent Word`);
        }
        break;
      default:
        throw new Error (`${infoBoxType} has not been implemented.`);
    }
    return result;
  }

  convertToInfoBoxType(value: string): InfoBoxTypes {
    let result: InfoBoxTypes;
    Object.keys(InfoBoxTypes).forEach( x => {
      if (value === InfoBoxTypes[x]) {
        result = InfoBoxTypes[x];
      }
    });
    return result;
  }

  getDataItem(dataType: string, item: MonthYearPivotItem | YearPivotItem | CategoryPivotItem, subType: string): any {
    let result: any;
    switch (dataType) {
      case 'count':
        switch (subType) {
          case 'totalAmount':
            result = item.totalAmount;
            break;
          case 'transactionCount':
            result = item.transactionCount;
            break;
          default:
            throw new Error(`${subType} is not a valid field for returning count data`);
        }
        break;
      case 'data':
        switch (subType) {
          case 'category':
            result = this.formatString(item['category']);
            break;
          case 'month':
            result = `${item['month']} ${item['year']}`;
            break;
          case 'year':
            result = item['year'];
            break;
          default:
            throw new Error(`${subType} is not a valid field for returning data elements`);
        }
        break;
      default:
        throw new Error(`${dataType} is not a valid data field`);
    }
    return result;
  }

  formatString (s: string) {
    return `${s.charAt(0).toUpperCase()}${s.substr(1)}`;
  }

  getEmptyCharts() {
    let result = new Array(0);
    if (this.dataModel.charts) {
      if (this.dataModel.charts.length <= this.maxCharts ) {
        result = new Array(this.maxCharts - this.dataModel.charts.length);
      }
    } else {
      result = new Array(this.maxCharts);
    }
    return result;
  }

  getEmptyInfoBoxes() {
    let result = new Array(0);
    if (this.infoBoxes) {
      if (this.infoBoxes.length <= this.maxInfoBoxes) {
        result = new Array(this.maxInfoBoxes - this.infoBoxes.length);
      }
    } else {
      result = new Array(this.maxInfoBoxes);
    }
    return result;
  }

  onEditChart(chartInfo: CustomChartInfo): void {
    const dialogRef = this.dialog.open(ChartDialogComponent, { data: chartInfo });
    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        if (result._id) {
          chartInfo = result;
        } else {
          this.charts.splice(this.charts.findIndex(x => x._id === chartInfo._id), 1);
          this.dataModel.charts.splice(this.dataModel.charts.findIndex(x => x === chartInfo._id), 1);
          this.saveDashboard();
        }
      }
    });
  }

  addChart(): void {
    const customChart: CustomChartInfo = {
      _id: null,
      userID: this.userInfo._id,
      title: null,
      description: null,
      searchParams: null,
      features: null,
      data: null
    };
    const dialogRef = this.dialog.open(ChartDialogComponent, { data: customChart, width: '1000px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result._id) {
        if (!this.dataModel.charts) {
          this.dataModel.charts = [];
        }
        this.dataModel.charts.push(result._id);
        this.saveDashboard();
        this.charts.push(result);
      }
      }
    );
  }
}
