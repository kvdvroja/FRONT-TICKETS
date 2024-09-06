import { TestBed } from '@angular/core/testing';

import { AsignarCategoriaService } from './asignar-categoria.service';

describe('AsignarCategoriaService', () => {
  let service: AsignarCategoriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignarCategoriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
