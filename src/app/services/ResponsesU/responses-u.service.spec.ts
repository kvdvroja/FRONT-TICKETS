import { TestBed } from '@angular/core/testing';

import { ResponsesUService } from './responses-u.service';

describe('ResponsesUService', () => {
  let service: ResponsesUService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsesUService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
