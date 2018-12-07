import {ChangeDetectorRef, Input, Component, OnInit} from '@angular/core';
import {PosterModel} from '../../models/poster-model';
import {MatDialog, MatTableDataSource} from '@angular/material';
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
  dataModel: MatTableDataSource<PosterModel>;
  posterData: PosterModel[];
  displayedColumns = ['title', 'description', 'actions'];
  currentUser: SiteUser;
  showSpinner: boolean;
  userList: SiteUser[];
  @Input() userID: string;
  @Input() showUserColumn = false;

  constructor(private dialog: MatDialog, private dashboardService: DashboardService, private userService: UserService,
              private changeDetect: ChangeDetectorRef) {
    this.currentUser = this.userService.getLoggedInUser();
  }

  ngOnInit() {
    if (this.showUserColumn) {
      this.displayedColumns = ['user', 'title', 'description', 'actions'];
    }
    this.showSpinner = true;
    if (this.showUserColumn) {
      this.userService.getUserList()
        .subscribe(
          data => this.userList = data,
          err => console.log(err)
        );
    }
    this.dashboardService.getUserPosters(this.userID)
      .subscribe(
        data => {
          this.posterData = data;
          this.dataModel = new MatTableDataSource<PosterModel>(this.posterData);
          this.showSpinner = false;
        },
        err => {
          console.log(err);
          this.showSpinner = false;
        }
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
        this.posterData.push(result);
        this.dataModel.data = this.posterData;
        this.changeDetect.detectChanges();
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
          this.changeDetect.detectChanges();
        } else {
          this.posterData.splice(this.posterData.findIndex(x => x._id === poster_id), 1);
          this.dataModel.data = this.posterData;
          this.changeDetect.detectChanges();
        }
      }
    });
  }

  getUserName(id: string): string {
    let result = id;
    const user = this.userList.find(x => x._id === id);
    if (user) {
      result = `${user.firstname} ${user.surname}`;
    }

    return result;
  }

}
