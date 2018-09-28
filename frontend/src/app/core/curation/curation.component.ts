import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TrainingData } from '../../shared/models/training-data.model';
import { UserService } from '../../shared/services/user.service';
import { AdminService } from '../../shared/services/admin.service';
import { SiteUser } from '../../shared/models/site-user.model';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { SpinnerService } from '../../shared/services/spinner.service';

@Component({
  selector: 'app-curation',
  templateUrl: './curation.component.html',
  styleUrls: ['./curation.component.scss']
})
export class CurationComponent implements OnInit, AfterViewInit {
  dataModel: MatTableDataSource<TrainingData>;
  currUser: SiteUser;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  displayColumns: string[] = ['pageid', 'month', 'words', 'reales', 'maravedises', 'categories'];

  @ViewChild('dataPaginator') paginator: MatPaginator;

  constructor(private userService: UserService, private adminService: AdminService, private spinnerService: SpinnerService) { }

  ngOnInit() {
    this.spinnerService.show('curationSpinner')
    this.currUser = this.userService.getLoggedInUser();
  }

  ngAfterViewInit() {
    this.adminService.getTrainingData(this.currUser._id)
      .subscribe(
        data => {
          this.dataModel = new MatTableDataSource<TrainingData>(data);
          // this.dataModel.paginator = this.paginator;
        },
        err => console.log(err),
        () => {
          console.log('Data Model loaded');
          this.spinnerService.hide('curationSpinner');
        }
      );
  }

  onSave() {
    console.log(this.dataModel.data[0].categories);
  }

  getDateInfo(month: number, year: number) {
    const dateObj = new Date(year, month, 1);
    const monthName = dateObj.toLocaleString('en-uk', { month: 'long' });
    return `${monthName} ${year}`;
  }

}
