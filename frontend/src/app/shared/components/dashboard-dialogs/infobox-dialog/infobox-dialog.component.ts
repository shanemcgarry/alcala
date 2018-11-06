import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { CustomInfoBox, InfoBoxTypes } from '../../../models/custom-dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-infobox-dialog',
  templateUrl: './infobox-dialog.component.html',
  styleUrls: ['./infobox-dialog.component.scss']
})
export class InfoboxDialogComponent {
  labelFC = new FormControl('', [
    Validators.required,
    Validators.maxLength(100)
  ]);
  typeFC = new FormControl('', [
    Validators.required
  ]);
  colourFC = new FormControl('', [
    Validators.required
  ]);
  iconFC = new FormControl('', [
    Validators.required
  ]);
  readonly validIcons = ['receipt', 'assignment_late', 'assignment_returned', 'assignment_turned_in', 'attach_money', 'money_off',
                         'account_balance', 'alarm_on', 'access_alarm', 'announcement', 'assessment', 'info', 'flag'];
  validTypes: any;
  constructor(public dialogRef: MatDialogRef<InfoboxDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dataModel: CustomInfoBox,
              private dashboardService: DashboardService) {

    this.validTypes = Object.keys(InfoBoxTypes)
      .map(x => ({
        value: InfoBoxTypes[x],
        label: x.replace(/([A-Z])/g, ' $1').trim()
      }));
    console.log('In the dialog');
    console.log(this.dataModel);
  }

  deleteObject(): void {
    this.dashboardService.deleteInfoBox(this.dataModel)
      .subscribe(
        x => {
          this.dataModel._id = null;
          this.dialogRef.close(this.dataModel);
        },
        err => console.log(err),
        () => console.log('Infobox Deleted')
      );
  }

  saveChanges(): void {
    this.dashboardService.saveInfoBox(this.dataModel)
      .subscribe(
        x => {
          this.dataModel = x;
          this.dialogRef.close(this.dataModel);
        },
        err => console.log(err),
        () => console.log('Infobox saved.')
      );
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  getDialogTitle(): void {
    let result;
    if (this.dataModel._id) {
      result = `Edit ${this.dataModel.label} InfoBox`;
    } else {
      result = 'Add New InfoBox';
    }

    return result;
  }

}
