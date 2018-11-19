import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

import { SiteUser } from '../../models/site-user.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  userName: string;
  password: string;
  siteUser: SiteUser;
  reqValid = new FormControl('', [Validators.required]);

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

  ngOnInit() {
  }
  login(): void {
    let navigation = this.route.snapshot.queryParams['returnUrl'];
    this.userService.login(this.userName, this.password)
      .subscribe(
        data => {
          this.siteUser = data;
          if (this.siteUser.loginToken) {
            if (!navigation) {
              navigation = '/experiment';
            }
            this.router.navigate([navigation]);
          }
        },
            error => console.log(error)
      );
  }
  getValidatorMessages(): string {
    return this.reqValid.hasError('required') ? 'You must provide a value' :
      '';
  }

}
