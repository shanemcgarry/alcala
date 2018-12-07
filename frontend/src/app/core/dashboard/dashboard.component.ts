import { Component, OnInit } from '@angular/core';
import {SiteUser} from '../../shared/models/site-user.model';
import {UserService} from '../../shared/services/user.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  showSamples = false;
  showCustomDash = true;
  showStories = false;
  currentUser: SiteUser;
  constructor(private userService: UserService) {
    this.currentUser = this.userService.getLoggedInUser();
  }
  ngOnInit() {

  }

  isAdmin(): boolean {
    return this.currentUser.roles.indexOf('admin') !== -1;
  }

  setView(view: string) {
    switch (view) {
      case 'samples':
        this.showSamples = true;
        this.showCustomDash = false;
        this.showStories = false;
        break;
      case 'custom':
        this.showCustomDash = true;
        this.showSamples = false;
        this.showStories = false;
        break;
      case 'stories':
        this.showStories = true;
        this.showSamples = false;
        this.showCustomDash = false;
        break;
    }
  }

}
