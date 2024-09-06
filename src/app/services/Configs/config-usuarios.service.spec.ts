import { TestBed } from '@angular/core/testing';

import { ConfigUsuariosService } from './config-usuarios.service';

describe('ConfigUsuariosService', () => {
  let service: ConfigUsuariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigUsuariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
