import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterDialogComponent } from './poster-dialog.component';

describe('PosterDialogComponent', () => {
  let component: PosterDialogComponent;
  let fixture: ComponentFixture<PosterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
