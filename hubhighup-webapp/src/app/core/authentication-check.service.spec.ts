import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationCheckService } from './authentication-check.service';

describe('AuthenticationCheckService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationCheckService]
    });
  });

  it('should ...', inject([AuthenticationCheckService], (service: AuthenticationCheckService) => {
    expect(service).toBeTruthy();
  }));
});
