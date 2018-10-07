import { TestBed, inject } from '@angular/core/testing';

import { GqlServiceService } from './gql-service.service';

describe('GqlServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GqlServiceService]
    });
  });

  it('should ...', inject([GqlServiceService], (service: GqlServiceService) => {
    expect(service).toBeTruthy();
  }));
});
