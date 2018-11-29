import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatCheckboxChange, MatDialogRef} from '@angular/material';
import {PosterModel, PosterSection} from '../../../models/poster-model';
import {DashboardService} from '../../../services/dashboard.service';
import {BoundaryObject, BoundaryObjectType} from '../../../models/custom-dashboard.model';
import {FormControl, Validators} from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-poster-dialog',
  templateUrl: './poster-dialog.component.html',
  styleUrls: ['./poster-dialog.component.scss']
})
export class PosterDialogComponent implements OnInit {
  boundaryObjects: BoundaryObject[];
  showSpinner: boolean;
  titleFC = new FormControl('', [Validators.required]);
  sectionTitleFC = new FormControl('', [Validators.required]);
  sectionColumns = ['title', 'description', 'notecards', 'actions'];
  boColumns = ['check', 'type', 'title', 'description'];
  currentSection: PosterSection;
  selection = new SelectionModel<BoundaryObject>(true, []);

  constructor(public dialogRef: MatDialogRef<PosterDialogComponent>, @Inject(MAT_DIALOG_DATA) public dataModel: PosterModel,
              private dashboardService: DashboardService) {
    this.clearSection();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.dashboardService.getBoundaryObjects(this.dataModel.userID)
      .subscribe(
        data => {
          this.boundaryObjects = data;
          this.showSpinner = false;
        },
        err => {
          console.log(err);
          this.showSpinner = false;
        }
      );
  }

  isBoundaryObjectInSection(boundaryObject: BoundaryObject): boolean {
    if (boundaryObject) {
      return this.currentSection.boundaryObjects.indexOf(boundaryObject._id) > -1;
    } else {
      return false;
    }

  }

  onCheckedChanged(event: MatCheckboxChange, boundaryObject: BoundaryObject): void {
    if (event.checked) {
      this.currentSection.boundaryObjects.push(boundaryObject._id);
    } else {
      this.currentSection.boundaryObjects.splice(this.currentSection.boundaryObjects.findIndex(x => x === boundaryObject._id), 1);
    }
  }

  getBoundaryObjectType(type: string): string {
    let result = type;
    switch (type) {
      case BoundaryObjectType.Page:
        result = 'Page';
        break;
      case BoundaryObjectType.Chart:
        result = 'Chart';
        break;
      case BoundaryObjectType.SearchResult:
        result = 'Keyword Search';
        break;
    }
    return result;
  }

  getSectionTitle(): string {
    return this.currentSection.title ? `Editing: ${this.currentSection.title}` : 'Add New Section';
  }

  addSection(): void {
    this.clearSection();
  }

  cancelSection(): void {
    this.clearSection();
  }

  saveSection(): void {
    this.dataModel.sections.push(this.currentSection);
    this.clearSection();
  }

  sectionValid(): boolean {
    let result = true;
    if (this.sectionTitleFC.hasError('required')) {
      result = false;
    }
    if (this.currentSection.boundaryObjects.length === 0) {
      result = false;
    }
    return result;
  }

  clearSection(): void {
    this.currentSection = {
      title: null,
      description: null,
      boundaryObjects: []
    };
  }

  editSection(section: PosterSection): void {
    this.currentSection = section;
    this.selection = new SelectionModel<BoundaryObject>(true, this.getSelectedBoundaryObjects());
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.currentSection.boundaryObjects.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.boundaryObjects.forEach(row => this.selection.select(row));
  }

  getSelectedBoundaryObjects(): BoundaryObject[] {
    const result: BoundaryObject[] = [];
    this.boundaryObjects.forEach(x => {
      if (this.currentSection.boundaryObjects.indexOf(x._id) !== -1) {
        result.push(x);
      }
    });
    return result;
  }

  deleteSection(section: PosterSection): void {
    this.dataModel.sections.splice(this.dataModel.sections.findIndex(x => x === section), 1);
  }

  hasErrors(): boolean {
    let result = false;
    if (this.titleFC.hasError('required')) {
      result = true;
    }
    if (this.dataModel.sections.length === 0) {
      result = true;
    }

    return result;
  }

  saveChanges(): void {
    this.showSpinner = true;
    this.dashboardService.saveUserPoster(this.dataModel)
      .subscribe(
        data => {
          this.dataModel = data;
          this.showSpinner = false;
          this.dialogRef.close(this.dataModel);
        },
        err => {
          console.log(err);
          this.showSpinner = false;
        }
      );
  }

  cancelChanges(): void {
    this.dialogRef.close();
  }

  deleteObject(): void {
    this.showSpinner = true;
    this.dashboardService.deleteUserPoster(this.dataModel)
      .subscribe(
        data => {
          this.dataModel._id = null;
          this.showSpinner = false;
          this.dialogRef.close(this.dataModel);
        },
        err => {
          console.log(err);
          this.showSpinner = false;
        }
      );
  }

  getDialogTitle(): string {
    return this.dataModel._id ? `Editing: ${this.dataModel.title}` : 'Add New Poster';
  }

}
