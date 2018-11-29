import { Component, OnInit } from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {UserService} from '../../services/user.service';
import {SearchService} from '../../services/search.service';
import {VisualisationService} from '../../../core/service/visualisation.service';
import {MatDialog} from '@angular/material';
import {SiteUser} from '../../models/site-user.model';
import {BoundaryObject} from '../../models/custom-dashboard.model';

@Component({
  selector: 'app-dashboard-notes',
  templateUrl: './dashboard-notes.component.html',
  styleUrls: ['./dashboard-notes.component.scss']
})
export class DashboardNotesComponent implements OnInit {
  userInfo: SiteUser;
  boundaryObjects: BoundaryObject[];

  constructor(private dashboardService: DashboardService, private userService: UserService, private searchService: SearchService,
              private visualisationService: VisualisationService, public dialog: MatDialog) {
    this.userInfo = this.userService.getLoggedInUser();
  }

  ngOnInit() {
    this.dashboardService.getBoundaryObjects(this.userInfo._id)
      .subscribe(
        data => this.boundaryObjects = data,
        err => console.log(err)
      );
  }

}
