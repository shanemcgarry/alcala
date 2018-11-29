import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterSectionComponent } from './poster-section.component';

describe('PosterSectionComponent', () => {
  let component: PosterSectionComponent;
  let fixture: ComponentFixture<PosterSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosterSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosterSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
