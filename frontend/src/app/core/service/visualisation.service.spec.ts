import { TestBed, inject } from '@angular/core/testing';

import { VisualisationService } from './visualisation.service';

describe('VisualisationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisualisationService]
    });
  });

  it('should be created', inject([VisualisationService], (service: VisualisationService) => {
    expect(service).toBeTruthy();
  }));
});
