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
    let result: boolean = false;
    if (currUser) {
      if (currUser.roles.find(x => x === 'admin')) {
        result = true;
      }
    }
    return result;
  }
}
