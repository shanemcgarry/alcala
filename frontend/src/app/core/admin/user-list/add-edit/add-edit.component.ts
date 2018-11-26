import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { FormControl, Validators} from '@angular/forms';
import {SiteUser} from '../../../../shared/models/site-user.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef} from '@angular/material';
import {UserService} from '../../../../shared/services/user.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class AddEditComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fcFirstName = new FormControl('', [Validators.required]);
  fcSurName = new FormControl('', [Validators.required]);
  fcUserName = new FormControl('', [Validators.required, Validators.min(5)]);
  fcEmail = new FormControl('', [Validators.email]);
  fcPassword = new FormControl('', [
    Validators.required,
    Validators.pattern('^(?=.*\\w[!@#$%?=&*])(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{8,16}$')
  ]);
  @ViewChild('userPassword') passwordField;
  showPassword = false;

  constructor(public dialogRef: MatDialogRef<AddEditComponent>,
              @Inject(MAT_DIALOG_DATA) public dataModel: SiteUser,
              private userService: UserService) { }

  ngOnInit() {
  }

  addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.dataModel.roles.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  removeRole(role: string) {
    this.dataModel.roles.splice(this.dataModel.roles.indexOf(role, 0));
  }

  getDialogTitle(): void {
    let result;
    if (this.dataModel._id) {
      result = `Edit ${this.dataModel.firstname} ${this.dataModel.surname}`;
    } else {
      result = 'Add New User';
    }

    return result;
  }

  validateForm(): boolean {
    let result = true;
    if (this.fcPassword.hasError('required') || this.fcPassword.hasError('pattern')) {
      result = false;
    }
    if (this.fcUserName.hasError('required') || this.fcUserName.hasError('min')) {
      result = false;
    }
    if (this.fcEmail.hasError('email')) {
      result = false;
    }
    if (this.fcFirstName.hasError('required')) {
      result = false;
    }
    if (this.fcSurName.hasError('required')) {
      result = false;
    }
    return result;
  }

  saveChanges(): void {
    this.userService.updateUser(this.dataModel)
      .subscribe(
        data => {
          this.dataModel = data;
          this.dialogRef.close(this.dataModel);
        },
        err => console.log(err)
      );
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  deleteUser(): void {
    this.userService.deleteUser(this.dataModel)
      .subscribe(
        x => {
          this.dataModel._id = null;
          this.dialogRef.close(this.dataModel);
        },
        err => console.log(err)
      );
  }

  generatePassword(): void {
    const validCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
                             'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
                             'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '%', '?', '=', '&',
                             '*'];

    const result = [];
    for (let i = 0; i < 8; i++) {
      result.push(validCharacters[Math.floor(Math.random() * validCharacters.length)]);
    }
    this.dataModel.password = result.join('');
    this.showPassword = true;
  }

}
