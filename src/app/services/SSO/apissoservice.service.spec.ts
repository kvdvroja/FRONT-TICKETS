import { TestBed } from '@angular/core/testing';

import { ApissoserviceService } from './apissoservice.service';

describe('ApissoserviceService', () => {
  let service: ApissoserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApissoserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
