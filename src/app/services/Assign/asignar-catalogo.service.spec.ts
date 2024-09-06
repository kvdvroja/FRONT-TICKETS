import { TestBed } from '@angular/core/testing';

import { AsignarCatalogoService } from './asignar-catalogo.service';

describe('AsignarCatalogoService', () => {
  let service: AsignarCatalogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignarCatalogoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
