import { TestBed, inject } from '@angular/core/testing';

import { UtilFunctionsService } from './util-functions.service';

describe('UtilFunctionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilFunctionsService]
    });
  });

  it('should ...', inject([UtilFunctionsService], (service: UtilFunctionsService) => {
    expect(service).toBeTruthy();
  }));
});
