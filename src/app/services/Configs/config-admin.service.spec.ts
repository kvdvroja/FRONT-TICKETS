import { TestBed } from '@angular/core/testing';

import { ConfigAdminService } from './config-admin.service';

describe('ConfigAdminService', () => {
  let service: ConfigAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
