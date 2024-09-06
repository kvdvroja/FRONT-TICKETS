import { TestBed } from '@angular/core/testing';

import { ViaRecepcionService } from './via-recepcion.service';

describe('ViaRecepcionService', () => {
  let service: ViaRecepcionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViaRecepcionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
