import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { CustomInfoBox } from '../../../models/custom-dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-infobox-dialog',
  templateUrl: './infobox-dialog.component.html',
  styleUrls: ['./infobox-dialog.component.scss']
})
export class InfoboxDialogComponent {
  labelFC = new FormControl('', [
    Validators.required,
    Validators.maxLength(50)
  ]);
  readonly validColours = ['blue', 'purple', 'yellow', 'brown'];
  readonly validIcons = ['receipt', 'assignment_late', 'assignment_returned', 'assignment_turned_in'];
  constructor(public dialogRef: MatDialogRef<InfoboxDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dataModel: CustomInfoBox,
              private dashboardService: DashboardService) {
  }

  saveChanges(): void {
    this.dashboardService.saveInfoBox(this.dataModel)
      .subscribe(
        x => this.dataModel = x,
        err => console.log(err),
        () => console.log('Infobox saved.')
      );
    this.dialogRef.close(this.dataModel);
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
