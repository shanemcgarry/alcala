import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VizsearchComponent } from './vizsearch.component';

describe('VizsearchComponent', () => {
  let component: VizsearchComponent;
  let fixture: ComponentFixture<VizsearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VizsearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VizsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
