import { Component, OnInit } from '@angular/core';
import {CustomChartInfo, CustomDashboardInfo, CustomInfoBox, CustomStoryInfo} from '../../models/custom-dashboard.model';
import {DashboardService} from '../../services/dashboard.service';
import {UserService} from '../../services/user.service';
import {SiteUser} from '../../models/site-user.model';
import {SearchService} from '../../services/search.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {InfoboxDialogComponent} from '../dashboard-dialogs/infobox-dialog/infobox-dialog.component';
import {DashboardComponent} from '../../../core/dashboard/dashboard.component';

@Component({
  selector: 'app-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {
  maxInfoBoxes = 4;
  maxCharts = 4;
  maxStories = 1;
  canCustomise = false;
  dataModel: CustomDashboardInfo;
  userInfo: SiteUser;

  constructor(private dashboardService: DashboardService, private userService: UserService, private searchService: SearchService, public dialog: MatDialog) {
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
        () => { console.log('Dashboard Data Loaded'); console.log(this.dataModel); }
      );
  }

  toggleCustomise(value: boolean): void {
    this.canCustomise = value;
  }

  addInfoBox(): void {
    const infoBoxData: CustomInfoBox = {
      _id: undefined,
      userID: this.userInfo._id,
      type: undefined,
      icon: undefined,
      label: undefined,
      colour: undefined
    };
    const dialogRef = this.dialog.open(InfoboxDialogComponent, {
      data: infoBoxData
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dataModel.infoBoxes.push(result);
          this.saveDashboard();
        }
      }
    );
  }

  saveDashboard(): void {
    this.dashboardService.saveUserDashboard(this.dataModel)
      .subscribe(
        x => this.dataModel = x,
        err => console.log(err),
        () => console.log('Dashboard saved.')
      );
  }

  getInfoBoxData(dataType: string, infoBoxType: string): any {
    return ''; // TODO: fix me
  }

  getEmptyStories() {
    let result = new Array(0);
    if (this.dataModel.stories) {
      if (this.dataModel.stories.length <= this.maxStories ) {
        result = new Array( this.maxStories - this.dataModel.stories.length);
      }
    } else {
      result = new Array(this.maxStories);
    }

    return result;
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

  addStory(): void {
    // TODO: implement me
  }

  getEmptyInfoBoxes() {
    let result = new Array(0);
    if (this.dataModel.infoBoxes) {
      if (this.dataModel.infoBoxes.length <= this.maxInfoBoxes) {
        result = new Array(this.maxInfoBoxes - this.dataModel.infoBoxes.length);
      }
    } else {
      result = new Array(this.maxInfoBoxes);
    }
    return result;
  }

  onRemoveChart(chartInfO: CustomChartInfo): void {
    const index = this.dataModel.charts.findIndex(x => x._id === chartInfO._id);
    this.dataModel.charts.splice(index, 1);
  }

  addChart(): void {
    //TODO: create a method to add a chart
  }

  generateChartData(chartInfo: CustomChartInfo): void {
    // TODO: create a method for retrieving archived search data
  }

  getChartWidth(): number {
    return 800; // TODO: Fix me
  }
}
