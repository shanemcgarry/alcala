import { Component, Inject } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MAT_DIALOG_DATA, MatDialogRef, MatChipInputEvent } from '@angular/material';
import { TrainingData } from '../../../shared/models/training-data.model';
import { AdminService } from '../../../shared/services/admin.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(public dialogRef: MatDialogRef<EditComponent>,
              @Inject(MAT_DIALOG_DATA) public dataModel: TrainingData,
              public adminService: AdminService ) {
  }

  addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.dataModel.categories.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  getDateInfo(): string {
    const dateObj = new Date(this.dataModel.year, this.dataModel.month, 1);
    const monthName = dateObj.toLocaleString('en-uk', { month: 'long' });
    return `${monthName} ${this.dataModel.year}`;
  }

  saveChanges() {
    this.adminService.saveTrainingData(this.dataModel)
      .subscribe(
        x => console.log(x),
        err => console.log(err),
        () => console.log('item updated')
      );
    this.dialogRef.close(this.dataModel);
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  getAmountInfo(): string {
    const real = this.dataModel.reales ? this.dataModel.reales : 0;
    const maravedi = this.dataModel.maravedises ? this.dataModel.maravedises : 0;
    return `${real}r ${maravedi}m`;
  }

  removeCategory(category: string) {
    this.dataModel.categories.splice(this.dataModel.categories.indexOf(category, 0));
  }

}
