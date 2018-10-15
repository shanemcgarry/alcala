import { Component, OnInit, ViewChild } from '@angular/core';
import { TrainingData } from '../../shared/models/training-data.model';
import { UserService } from '../../shared/services/user.service';
import { AdminService } from '../../shared/services/admin.service';
import { SiteUser } from '../../shared/models/site-user.model';
import {MatTableDataSource, MatPaginator, MatDialog} from '@angular/material';
import { SpinnerService } from '../../shared/services/spinner.service';
import {EditComponent} from './edit/edit.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-curation',
  templateUrl: './curation.component.html',
  styleUrls: ['./curation.component.scss']
})
export class CurationComponent implements OnInit {
  dataModel: MatTableDataSource<TrainingData> = new MatTableDataSource<TrainingData>();
  currUser: SiteUser;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  displayColumns: string[] = ['pageid', 'month', 'words', 'reales', 'maravedises', 'categories', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private userService: UserService, private adminService: AdminService, private spinnerService: SpinnerService, private dialog: MatDialog) { }

  ngOnInit() {
    this.spinnerService.show('curationSpinner');
    this.currUser = this.userService.getLoggedInUser();
    this.adminService.getTrainingData(this.currUser._id)
      .subscribe(
        data => {
          this.dataModel.data = data;
          this.dataModel.paginator = this.paginator;
        },
        err => console.log(err),
        () => {
          console.log('Data Model loaded');
          this.spinnerService.hide('curationSpinner');
        }
      );
  }

  editData(rowData: TrainingData) {
    const dialogRef = this.dialog.open(EditComponent, { data: cloneDeep(rowData) });
    const origCategories = cloneDeep(rowData.categories);
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        rowData.categories = origCategories;
      } else {
        const updateData = this.dataModel.data.filter(x => x._id === result._id)[0];
        updateData.categories = result.categories;
      }
    });
  }

  getDateInfo(month: number, year: number) {
    const dateObj = new Date(year, month, 1);
    const monthName = dateObj.toLocaleString('en-uk', { month: 'long' });
    return `${monthName} ${year}`;
  }

}
