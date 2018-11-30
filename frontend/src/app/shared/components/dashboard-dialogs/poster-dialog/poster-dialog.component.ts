import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatCheckboxChange, MatDialogRef, MatTableDataSource} from '@angular/material';
import {PosterModel, PosterSection} from '../../../models/poster-model';
import {DashboardService} from '../../../services/dashboard.service';
import {BoundaryObject, BoundaryObjectType} from '../../../models/custom-dashboard.model';
import {FormControl, Validators} from '@angular/forms';
// @ts-ignore
import * as cloneDeep from 'lodash/cloneDeep';

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
  sectionsDS: MatTableDataSource<PosterSection>;
  isEditSection: boolean;

  constructor(public dialogRef: MatDialogRef<PosterDialogComponent>, @Inject(MAT_DIALOG_DATA) public dataModel: PosterModel,
              private dashboardService: DashboardService, private changeDetect: ChangeDetectorRef) {
    this.clearSection();
    this.sectionsDS = new MatTableDataSource<PosterSection>(dataModel.sections);
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
    this.isEditSection = false;
  }

  cancelSection(): void {
    this.clearSection();
  }

  saveSection(): void {
    if (!this.isEditSection) {
      this.dataModel.sections.push(cloneDeep(this.currentSection));
    }
    this.clearSection();
    this.sectionsDS.data = this.dataModel.sections;
    this.changeDetect.detectChanges();
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

    if (this.boundaryObjects) {
      this.boundaryObjects.forEach(x => {
        x.isSelected = false;
      });
    }
  }

  editSection(section: PosterSection): void {
    this.isEditSection = true;
    this.currentSection = section;
    this.boundaryObjects.forEach(x => {
      x.isSelected = this.currentSection.boundaryObjects.indexOf(x._id) !== -1;
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.boundaryObjects.length === this.currentSection.boundaryObjects.length;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  addAllObjects(e: MatCheckboxChange) {
    if (e.checked) {
      this.boundaryObjects.forEach(x => {
        if (this.currentSection.boundaryObjects.indexOf(x._id) === -1) {
          this.currentSection.boundaryObjects.push(x._id);
          x.isSelected = true;
        }
      });
    } else {
      this.currentSection.boundaryObjects = [];
      this.boundaryObjects.forEach(x => {
        x.isSelected = false;
      });
    }
  }

  deleteSection(section: PosterSection): void {
    this.dataModel.sections.splice(this.dataModel.sections.findIndex(x => x === section), 1);
    this.sectionsDS.data = this.dataModel.sections;
    this.changeDetect.detectChanges();
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
