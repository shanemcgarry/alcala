import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundaryObjectComponent } from './boundary-object.component';

describe('BoundaryObjectComponent', () => {
  let component: BoundaryObjectComponent;
  let fixture: ComponentFixture<BoundaryObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundaryObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundaryObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
