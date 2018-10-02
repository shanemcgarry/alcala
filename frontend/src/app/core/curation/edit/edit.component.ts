import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TrainingData } from '../../../shared/models/training-data.model';
import { AdminService } from '../../../shared/services/admin.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent {
  constructor(public dialogRef: MatDialogRef<EditComponent>,
              @Inject(MAT_DIALOG_DATA) public dataModel: TrainingData,
              public adminService: AdminService ) {
  }

  getDateInfo() {
    const dateObj = new Date(this.dataModel.year, this.dataModel.month, 1);
    const monthName = dateObj.toLocaleString('en-uk', { month: 'long' });
    return `${monthName} ${this.dataModel.year}`;
  }

  submit() {
    //do stuff here
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  removeCategory(category: string) {
    this.dataModel.categories.splice(this.dataModel.categories.indexOf(category, 0));
  }

}
