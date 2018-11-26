import { Component, OnInit, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import {SiteUser} from '../../../shared/models/site-user.model';
import {MatPaginator, MatTableDataSource, MatSort, MatDialog} from '@angular/material';
import {UserService} from '../../../shared/services/user.service';
import {AddEditComponent} from './add-edit/add-edit.component';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  dataModel: MatTableDataSource<SiteUser> = new MatTableDataSource<SiteUser>();
  displayColumns = ['firstname', 'lastname', 'emailaddress', 'username', 'roles', 'lastlogin', 'actions', 'add'];
  showSpinner = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private userService: UserService, private dialog: MatDialog) { }

  ngOnInit() {
    this.showSpinner = true;
    this.userService.getUserList()
      .subscribe(
        data => {
          this.dataModel = new MatTableDataSource<SiteUser>(data);
          this.dataModel.paginator = this.paginator;
          this.dataModel.sort = this.sort;
          this.showSpinner = true;
        },
        err => {
          console.log(err);
          this.showSpinner = false;
        }
      );
  }

  getFormattedDate(value: string) {
    let result = null;
    if (value) {
      const tempDate = new Date(value.substr(0, value.indexOf('.')));
      const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
      result = tempDate.toLocaleDateString('en-IE', options);
    }
    return result;
  }

  addPerson(): void {
    const newUser: SiteUser = {
      _id: null,
      firstname: null,
      surname: null,
      allowLogging: true,
      username: null,
      password: null,
      emailAddress: null,
      roles: [],
      loginToken: null,
      lastLogin: null,
    };
    const dialogRef = this.dialog.open(AddEditComponent, {data: newUser});
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dataModel.data.push(result);
        }
      });
  }

  editData(user: SiteUser): void {
    const dialogRef = this.dialog.open(AddEditComponent, {data: user});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result._id) {
          this.dataModel.data.push(result);
        } else {
          this.dataModel.data.splice(this.dataModel.data.findIndex(x => x.username === result.username), 1);
        }
      }
    });
  }
}
