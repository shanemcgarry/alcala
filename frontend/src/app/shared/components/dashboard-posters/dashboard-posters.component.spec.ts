import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPostersComponent } from './dashboard-posters.component';

describe('DashboardPostersComponent', () => {
  let component: DashboardPostersComponent;
  let fixture: ComponentFixture<DashboardPostersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPostersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPostersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
