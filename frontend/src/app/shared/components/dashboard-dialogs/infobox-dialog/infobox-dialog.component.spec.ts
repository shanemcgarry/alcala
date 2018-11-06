import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoboxDialogComponent } from './infobox-dialog.component';

describe('InfoboxDialogComponent', () => {
  let component: InfoboxDialogComponent;
  let fixture: ComponentFixture<InfoboxDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoboxDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
