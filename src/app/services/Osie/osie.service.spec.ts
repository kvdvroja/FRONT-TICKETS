import { TestBed } from '@angular/core/testing';

import { OsieService } from './osie.service';

describe('OsieService', () => {
  let service: OsieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
