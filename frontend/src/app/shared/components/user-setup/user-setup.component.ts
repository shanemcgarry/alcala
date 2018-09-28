import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-user-setup',
  templateUrl: './user-setup.component.html',
  styleUrls: ['./user-setup.component.scss']
})
export class UserSetupComponent implements OnInit {
  searchVideo = 'bhxhNIQBKJI';
  dashboardVideo = '0I647GU3Jsc';
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

  ngOnInit() {
  }
  setSelection(useDashboard: boolean): void {
    this.userService.setPreferences(this.userService.getLoggedInUser()._id, useDashboard)
      .subscribe(
        data => {
          let destination = '/visualise/dashboard';
          if (!useDashboard) {
            destination = '/search';
          }
          this.router.navigate([destination]);
        },
        err => console.log(err)
      );
  }

}
