import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundaryobjectDialogComponent } from './boundaryobject-dialog.component';

describe('BoundaryobjectDialogComponent', () => {
  let component: BoundaryobjectDialogComponent;
  let fixture: ComponentFixture<BoundaryobjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundaryobjectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundaryobjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
