import { TestBed } from '@angular/core/testing';

import { PrioridadService } from './prioridad.service';

describe('PrioridadService', () => {
  let service: PrioridadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrioridadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
