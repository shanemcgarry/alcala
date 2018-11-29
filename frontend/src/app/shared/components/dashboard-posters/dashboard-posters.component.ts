import { Component, OnInit } from '@angular/core';
import {PosterModel} from '../../models/poster-model';
import {MatDialog} from '@angular/material';
import {DashboardService} from '../../services/dashboard.service';
import {UserService} from '../../services/user.service';
import {SiteUser} from '../../models/site-user.model';
import {PosterDialogComponent} from '../dashboard-dialogs/poster-dialog/poster-dialog.component';

@Component({
  selector: 'app-dashboard-posters',
  templateUrl: './dashboard-posters.component.html',
  styleUrls: ['./dashboard-posters.component.scss']
})
export class DashboardPostersComponent implements OnInit {
  dataModel: PosterModel[];
  displayedColumns = ['title', 'description', 'actions'];
  currentUser: SiteUser;

  constructor(private dialog: MatDialog, private dashboardService: DashboardService, private userService: UserService) {
    this.currentUser = this.userService.getLoggedInUser();
  }

  ngOnInit() {
    this.dashboardService.getUserPosters(this.currentUser._id)
      .subscribe(
        data => this.dataModel = data,
        err => console.log(err)
      );
  }

  addPoster(): void {
    const poster: PosterModel = {
      _id: null,
      userID: this.currentUser._id,
      title: null,
      description: null,
      sections: [],
      dateCreated: new Date()
    };
    const dialogRef = this.dialog.open(PosterDialogComponent, { data: poster });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result._id) {
        this.dataModel.push(result);
      }
    });
  }

  editPoster(poster: PosterModel): void {
    const dialogRef = this.dialog.open(PosterDialogComponent, {data: poster});
    const poster_id = poster._id;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result._id) {
          poster = result;
        } else {
          this.dataModel.splice(this.dataModel.findIndex(x => x._id === poster_id), 1);
        }
      }
    });
  }

}
