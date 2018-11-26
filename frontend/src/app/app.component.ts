import { Component } from '@angular/core';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Alcala Record Books';
  constructor(public userService: UserService) {}

  isAdminUser() {
    const currUser = this.userService.getLoggedInUser();
    let result = false;
    if (currUser && currUser.roles) {
      if (currUser.roles.find(x => x === 'admin' || x === 'super')) {
        result = true;
      }
    }
    return result;
  }
}
