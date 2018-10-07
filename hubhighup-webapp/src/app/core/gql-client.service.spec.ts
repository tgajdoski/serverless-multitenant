import { TestBed, inject } from '@angular/core/testing';

import { GqlClientService } from './gql-client.service';

describe('GqlClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GqlClientService]
    });
  });

  it('should ...', inject([GqlClientService], (service: GqlClientService) => {
    expect(service).toBeTruthy();
  }));
});
